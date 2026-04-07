import fetch from "node-fetch";

export async function handleSellAuthWebhook(req, res, client) {
    try {
        const { event, data } = req.body;

        console.log("Webhook Body:", req.body);

        if (event !== "NOTIFICATION.SHOP_FEEDBACK_CREATED") {
            return res.status(200).send("Ignored event");
        }

        const feedbackId = data.feedback_id || data.id;

        if (!feedbackId) {
            console.error("❌ Keine Feedback-ID im Webhook gefunden!");
            return res.status(400).send("Missing feedback ID");
        }

        const apiKey = client.config.apiKey;

        const response = await fetch(`https://api.sellauth.com/v1/feedbacks/${feedbackId}`, {
            headers: {
                "Authorization": `Bearer ${apiKey}`
            }
        });

        const feedback = await response.json();

        console.log("SellAuth API Response:", feedback);

        const channel = client.channels.cache.get(client.config.vouchChannel);
        if (!channel) {
            console.error("❌ Channel nicht gefunden!");
            return res.status(500).send("Channel not found");
        }

        const embed = client.renderFeedbackEmbed(feedback);
        await channel.send({ embeds: [embed] });

        return res.status(200).send("OK");

    } catch (err) {
        console.error("Webhook Error:", err);
        return res.status(500).send("Internal error");
    }
}
