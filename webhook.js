import { renderDMEmbed } from "./dmEmbed.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export async function handleSellAuthWebhook(req, res, client) {
  try {
    const { event, data } = req.body;

    if (event !== "NOTIFICATION.SHOP_FEEDBACK_CREATED") {
      return res.status(200).send("Ignored event");
    }

    const feedbackId = data.feedback_id;

    const response = await fetch(`https://api.sellauth.com/v1/feedbacks/${feedbackId}`, {
      headers: {
        Authorization: `Bearer ${process.env.SELLAUTH_API_KEY}`
      }
    });

    const feedback = await response.json();

    const stars = "⭐".repeat(feedback.rating);
    const vouchNumber = client.vouchCounter++;

    // UNIX TIMESTAMP (für beide Embeds)
    const unixTime = Math.floor(new Date(feedback.created_at).getTime() / 1000);

    // PUBLIC VOUCH EMBED
    const embed = client.renderFeedbackEmbed({
      vouchNumber,
      stars,
      comment: feedback.feedback,
      user_display: feedback.discord_id ? `<@${feedback.discord_id}>` : "SellAuth Client",
      created_at: unixTime,
      thumbnail: "https://media.discordapp.net/attachments/1490754874940325948/1490762334665314314/GIF.gif",
      image: null
    });

    const channel = client.channels.cache.get(client.config.vouchChannel);
    if (channel) {
      await channel.send({ embeds: [embed] });
    } else {
      console.log("Vouch channel not found!");
    }

    // ⭐ BUTTON ONLY FOR DM
    const buttonRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Open Website")
        .setStyle(ButtonStyle.Link)
        .setURL("https://ogsware.com")
    );

    // ⭐ DM the user with the coupon embed
    if (feedback.discord_id) {
      try {
        const user = await client.users.fetch(feedback.discord_id);

        const dmEmbed = renderDMEmbed({
          vouchNumber,
          stars,
          created_at: unixTime, // FIXED — UNIX timestamp
          comment: feedback.feedback
        });

        await user.send({
          embeds: [dmEmbed],
          components: [buttonRow]
        });
      } catch (err) {
        console.log("Failed to DM user:", err.message);
      }
    }

    client.saveCounter();
    res.status(200).send("OK");

  } catch (err) {
    console.error(err);
    res.status(500).send("Error processing webhook");
  }
}
