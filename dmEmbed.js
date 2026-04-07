import { EmbedBuilder } from "discord.js";

export function renderDMEmbed({ vouchNumber, stars, created_at, comment }) {
  return new EmbedBuilder()
    .setColor("#FFFF00")
    .setTitle("Thank you for your feedback! ⭐️")
    .setDescription(
      `Here is a 10% discount for your next purchase:\n` +
      `\`\`\`TFDB37JUG\`\`\`\n` +
      `**Your Comment:**\n${comment}`
    )
    .addFields(
      { name: "Vouch N°:", value: `${vouchNumber}`, inline: true },
      { name: "Stars:", value: `${stars}`, inline: true },
    )
    .setImage("https://media.discordapp.net/attachments/1490754874940325948/1491027116647518259/G23FX56.gif")
    .setThumbnail("https://media.discordapp.net/attachments/1490754874940325948/1490762334665314314/GIF.gif")
    .setFooter({
      text: "OGSWare Vouches",
      iconURL: "https://media.discordapp.net/attachments/1490754874940325948/1490762334665314314/GIF.gif"
    })
    .setTimestamp();
}
