import { EmbedBuilder } from "discord.js";

export function renderFeedbackEmbed(data) {
  return new EmbedBuilder()
    .setColor("#FFFF00")
    .setTitle("New Vouch Received! 🎉")
    .setThumbnail(data.thumbnail)
    .setDescription(`**Comment:**\n${data.comment}`)
    .addFields(
      { name: "Vouch N°:", value: `${data.vouchNumber}`, inline: true },
      { name: "Stars:", value: `${data.stars}`, inline: true },
      { name: "Vouched By:", value: `${data.user_display}`, inline: true },
    )
    .setImage(data.image || null)
    .setFooter({
      text: "OGSWare Vouches",
      iconURL: "https://media.discordapp.net/attachments/1490754874940325948/1490762334665314314/GIF.gif"
    })
    .setTimestamp();
}
