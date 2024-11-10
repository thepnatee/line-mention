const { onRequest } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
setGlobalOptions({
    region: "asia-northeast1",
})
const axios = require("axios");
exports.webhook = onRequest(async (request, response) => {

    if (request.method !== "POST") {
        return response.status(200).send("Method Not Allowed");
    }

    const events = request.body.events
    for (const event of events) {

        console.log(JSON.stringify(event));

        if (event.source.type !== "group") {
            await isAnimationLoading(event.source.userId)
        }

        if (event.type === "message" && event.message.type === "text") {


            if(event.message.text ==="@Bot"){
                await reply(event.replyToken, [{
                    "type": "text",
                    "text": 'ว่ายังไงครับ มีอะไรให้ช่วยครับ?'
                }])
    
            }

            if (event.message.mention && event.message.mention.mentionees) {

                for (let mentionee of event.message.mention.mentionees) {

                    if (mentionee.isSelf === true) {

                        await reply(event.replyToken, [{
                            "type": "textV2",
                            "text": "ว่ายังไงครับ {user1}! มีอะไรให้ช่วยครับ?",
                            "substitution": {
                                    "user1": {
                                        "type": "mention",
                                        "mentionee": {
                                            "type": "user",
                                            "userId": event.source.userId
                                        }
                                    }
                                }
                        }]);

                    }
                }
            }
        }
        if (event.type === "memberJoined") {

            for (let member of event.joined.members) {

                if (member.type === "user") {

                    await reply(event.replyToken, [{
                        "type": "textV2",
                        "text": "สวัสดีคุณ {user1}! ยินดีต้อนรับ {emoji1} \n ทุกคน {everyone} มีเพื่อนใหม่เข้ามาอย่าลืมทักทายกันนะ!",
                        "substitution": {
                            "user1": {
                                "type": "mention",
                                "mentionee": {
                                    "type": "user",
                                    "userId": member.userId
                                }
                            },
                            "emoji1": {
                                "type": "emoji",
                                "productId": "5ac2280f031a6752fb806d65",
                                "emojiId": "001"
                            },
                            "everyone": {
                                "type": "mention",
                                "mentionee": {
                                    "type": "all"
                                }
                            }
                        }
                    }])
                }
            }
        }

    }
    return response.end();

})


/*
#Display a loading animation
https://developers.line.biz/en/reference/messaging-api/#send-broadcast-message
*/
async function isAnimationLoading (userId) {
    try {

        const url = `https://api.line.me/v2/bot/chat/loading/start`;
        const response = await axios.post(url, {
            "chatId": `${userId}`,
            "loadingSeconds": 10 // The default value is 20.
            // Number of seconds to display a loading animation. You can specify a any one of 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, or 60.
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.LINE_MESSAGING_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        if (response.status === 202) {
            return response.data;
        } else {
            throw new Error(`Failed to send Animation loading: ${response.status}`);
        }
    } catch (error) {
        console.error('Error sending Animation loading:', error.message);
        throw error;
    }
};


/*Reply Long Live Token*/
async function reply (token, payload) {
    const url = `https://api.line.me/v2/bot/message/reply`;
    const response = await axios.post(url, {
        replyToken: token,
        messages: payload
    }, {
        headers: {
            'Authorization': `Bearer ${process.env.LINE_MESSAGING_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
        }
    });

    if (response.status === 200) {
        return response.data;
    } else {
        throw new Error(`Failed to send reply: ${response.status}`);
    }
};
