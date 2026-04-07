import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from "discord.js";

import { renderDMEmbed } from "./dmEmbed.js";

export default {
  data: new SlashCommandBuilder()
    .setName("createvouch")
    .setDescription("Create a vouch with rating, feedback and optional image.")
    .addIntegerOption(option =>
      option
        .setName("rating")
        .setDescription("Your rating from 1 to 5")
        .setRequired(true)
        .addChoices(
          { name: "⭐ 1 Star", value: 1 },
          { name: "⭐⭐ 2 Stars", value: 2 },
          { name: "⭐⭐⭐ 3 Stars", value: 3 },
          { name: "⭐⭐⭐⭐ 4 Stars", value: 4 },
          { name: "⭐⭐⭐⭐⭐ 5 Stars", value: 5 }
        )
    )
    .addStringOption(option =>
      option
        .setName("comment")
        .setDescription("Your feedback comment")
        .setRequired(true)
    )
    .addAttachmentOption(option =>
      option
        .setName("image")
        .setDescription("Optional image attachment")
        .setRequired(false)
    ),

  async execute(interaction, client) {
    const rating = interaction.options.getInteger("rating");
    const comment = interaction.options.getString("comment");
    const imageAttachment = interaction.options.getAttachment("image");

    const stars = "⭐".repeat(rating);
    const image = imageAttachment ? imageAttachment.url : null;

    const vouchNumber = client.vouchCounter++;

    // PUBLIC VOUCH EMBED (NO BUTTON)
    const embed = client.renderFeedbackEmbed({
      vouchNumber,
      stars,
      comment,
      user_display: `<@${interaction.user.id}>`,
      created_at: Math.floor(Date.now() / 1000) ,
      thumbnail: interaction.user.displayAvatarURL(),
      image
    });

    const channel = client.channels.cache.get(client.config.vouchChannel);
    await channel.send({ embeds: [embed] });

    // BUTTON ONLY FOR DM
    const buttonRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Open Website")
        .setStyle(ButtonStyle.Link)
        .setURL("https://ogsware.com")
    );

    // DM EMBED
    try {
      const dmEmbed = renderDMEmbed({
        vouchNumber,
        stars,
        created_at: new Date().toLocaleString(),
        comment
      });

      await interaction.user.send({
        embeds: [dmEmbed],
        components: [buttonRow] // ⭐ ONLY HERE
      });
    } catch (err) {
      console.log("Failed to DM user:", err.message);
    }

    client.saveCounter();

    await interaction.reply({
      content: "Your vouch has been successfully created!",
      ephemeral: true
    });
  }
};
