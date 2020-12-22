// modules and setup information
const Discord = require("discord.js");
const client = new Discord.Client({ autoReconnect: true, disableEveryone: true });
const wtf = require("wtf_wikipedia");
const GenerateImage = require("generate-image");
const fs = require("fs");
const svg2img = require("svg2img");
const axios = require("axios").default;
const cheerio = require("cheerio");
const config = require("./config.json");
const info = require("./info.json");

// bot login
client.login(config.token);

client.on("ready", () => {
    // log that bot has successfully started
    console.log("Vexibot lives!");

    // set presence
    client.user.setPresence({ activity: { name: "my master Vexilon.", type: "WATCHING" }, status: "dnd" });

    // check for new ukikipedia news posts every half hour
    // setInterval(function() {
    //     axios.get("https://news.ukikipedia.net/")
    //         .then(response =>  {
    //             if (response.status === 200) {
    //                 let vex = client.users.cache.find(u => u.id === config.creatorid);
    //                 let $ = cheerio.load(response.data);

    //                 let postLink = $("h2.entry-title", "header.entry-header").children().first().attr("href");

    //                 fs.readFile("info.json", (err, data) => {
    //                     if (err) throw err;
                        
    //                     let current = JSON.parse(data);

    //                     if (current.ukikilink !== postLink) {
    //                         current.ukikilink = postLink;

    //                         axios.get(current.ukikilink)
    //                             .then(response => {
    //                                 if (response.status === 200) {
    //                                     $ = cheerio.load(response.data);

    //                                     let postTitle = $("h1.entry-title", "header.entry-header").text();
    //                                     let postSummary = "";

    //                                     $("p", "div.entry-content").each(function() {
    //                                         postSummary += $(this).text() + "\n\n";
    //                                     });

    //                                     if (postSummary.length > 1000) postSummary = postSummary.substr(0, 1000) + "...";

    //                                     console.log("Retrieved new Ukikipedia news post and sent it!");
    //                                     vex.send({ embed: {
    //                                                 title: postTitle,
    //                                                 description: postSummary,
    //                                                 color: 16727614,
    //                                                 timestamp: new Date(),
    //                                                 footer: {
    //                                                     text: "Ukikipedia News"
    //                                                 },
    //                                                 thumbnail: {
    //                                                     url: "https://cdn.discordapp.com/attachments/563511348185530378/742521221434048532/ukikipedia_logo.png"
    //                                                 },
    //                                                 fields: [
    //                                                     {
    //                                                         name: "Link to News Post",
    //                                                         value: current.ukikilink
    //                                                     }
    //                                                 ]
    //                                             }}).then(msg => {
    //                                                 fs.writeFile("info.json", JSON.stringify(current), err => {
    //                                                     if (err) throw err;
    //                                                 });
    //                                             }).catch(err => {
    //                                                 console.error(`An error occurred while trying to send a Ukikipedia news post:\n${err}`);
    //                                                 return vex.send("**An error occurred while trying to send a Ukikipedia news post:**```" + err + "```");
    //                                             });
    //                                 }
    //                             }).catch(error => console.error(error));
    //                     }
    //                 });
    //             }
    //         }).catch(error => console.error(error));
    // }, 1.8e+6);
});

// error event
client.on("error", e => console.error(e));

// warn event
client.on("warn", e => console.warn(e));

client.on("message", async message => {
    // make sure author is vex
    if (message.author.id !== config.creatorid) return;

    // various variable setup
    let command;
    let mentionMessage;
    let args;
    
    let emojisInMessage;
    let linksInMessage;
    let nextArg;

    let emojiURL;
    let emojiName;
    let emojiServer;

    if (message.content.startsWith(config.prefix)) command = message.content.split(" ")[0].slice(config.prefix.length).toLowerCase();
    else mentionMessage = message.content.split(" ").slice(1).join(" ").replace(/\s/g, "").toLowerCase();
    
    if (message.content.startsWith(config.prefix)) args = message.content.split(" ").slice(1).join(" ").replace(/\s\s+/g, " ");
    else args = message.content.replace(/\s\s+/g, " ");

    // collect emojis in message
    emojisInMessage = args.match(/<a?:.+?:\d+>/g);
    linksInMessage = args.match(/https?:\/\/[^\s]+\.((png\?*[^\s]*)|(gif\?*[^\s]*)|(jpg\?*[^\s]*))/g);
    emojiServer = client.guilds.cache.find(g => g.id === "600178288593207316");

    if (emojisInMessage) {
        // create emoji(s) in emote server based on emojis sent
        for (let i = 0; i < emojisInMessage.length; ++i) {
            if (message.channel.type !== "dm") break;

            // determine emoji url
            if (emojisInMessage[i].startsWith("<a:")) emojiURL = `https://cdn.discordapp.com/emojis/${emojisInMessage[i].match(/:\d+>/).join("").slice(1, -1)}.gif`;
            else emojiURL = `https://cdn.discordapp.com/emojis/${emojisInMessage[i].match(/:\d+>/).join("").slice(1, -1)}.png`;
            
            nextArg = args.split(" ")[args.split(" ").indexOf(emojisInMessage[i]) + 1];

            // determine emoji name
            if (!nextArg || nextArg.match(/<a?:.+?:\d+>/) || nextArg.startsWith("https://") || nextArg.startsWith("http://")) emojiName = emojisInMessage[i].match(/:.+?:/).join("").slice(1, -1);
            else emojiName = nextArg;

            await emojiServer.emojis.create(emojiURL, emojiName)
                .then(e => {
                    console.log(`Emoji :${emojiName}: added!`);
                    message.channel.send(`Emoji **:${emojiName}:** added!`);
                })
                .catch(err => {
                    console.error(`An error occurred while trying to add an emoji by the name of ${emojiName}:\n${err}`);
                    return message.channel.send("**An error occurred while trying to add an emoji by the name of " + emojiName + ":**```" + err + "```");
            });
        }
    }

    if (linksInMessage) {
        // create emoji(s) in emote server based on links sent
        for (let i = 0; i < linksInMessage.length; ++i) {
            if (message.channel.type !== "dm") break;

            // handle image uploads
            if (linksInMessage[i].match(/https?:\/\/cdn.discordapp.com\/attachments\/\d+\/\d+\/[\w-]+\.((png\?*[^\s]*)|(gif\?*[^\s]*)|(jpg\?*[^\s]*))/)) {
                emojiURL = linksInMessage[i];

                nextArg = args.split(" ")[args.split(" ").indexOf(linksInMessage[i]) + 1];

                // determine emoji name
                if (!nextArg || nextArg.match(/<a?:.+?:\d+>/) || nextArg.startsWith("https://") || nextArg.startsWith("http://")) emojiName = linksInMessage[i].match(/[\w-]+\.(png|gif|jpg)/).join("").slice(0, -4);
                else emojiName = nextArg;

                await emojiServer.emojis.create(emojiURL, emojiName)
                    .then(e => {
                        console.log(`Emoji :${emojiName}: added!`);
                        message.channel.send(`Emoji **:${emojiName}:** added!`);
                    })
                    .catch(err => {
                        console.error(`An error occurred while trying to add an emoji by the name of ${emojiName}:\n${err}`);
                        return message.channel.send("**An error occurred while trying to add an emoji by the name of " + emojiName + ":**```" + err + "```");
                });
            // handle emoji and other links
            } else {
                emojiURL = linksInMessage[i];

                nextArg = args.split(" ")[args.split(" ").indexOf(linksInMessage[i]) + 1];

                // determine emoji name
                if (!nextArg || nextArg.match(/<a?:.+?:\d+>/) || nextArg.startsWith("https://") || nextArg.startsWith("http://")) {
                    console.error(`An emoji with a URL of "${emojiURL}" was attempted to be added, but no name was specified.`);
                    message.channel.send(`You need to specify a name for all emojis that are not added via a Discord image upload URL!\nThe emoji with a URL of **${emojiURL}** was not added.`);
                } else {
                    emojiName = nextArg;

                    await emojiServer.emojis.create(emojiURL, emojiName)
                        .then(e => {
                            console.log(`Emoji :${emojiName}: added!`);
                            message.channel.send(`Emoji **:${emojiName}:** added!`);
                        })
                        .catch(err => {
                            console.error(`An error occurred while trying to add an emoji by the name of ${emojiName}:\n${err}`);
                            return message.channel.send("**An error occurred while trying to add an emoji by the name of " + emojiName + ":**```" + err + "```");
                    });
                }
            }
        }
    }


    // handle input
    if (command === "ping" || !message.content.startsWith(config.prefix) && args.replace(/\s/g, "").toLowerCase() === "ping") {
        message.channel.send("Pong!")
            .then(msg => {
                msg.edit(`__***Stats:***__\n\n**LATENCY:** ${msg.createdTimestamp - message.createdTimestamp}ms.\n**API LATENCY:** ${Math.round(client.ws.ping)}ms.`);
        });
    } else if (!message.content.startsWith(config.prefix) && args.trim().toLowerCase().startsWith("what is")) {
        args = args.split(" ").slice(2).join(" ");
        if (!args) return message.channel.send("Please include something for me to find!");

        let wiki = await wtf.fetch(args, "en");

        if (wiki) {
            let text = wiki.text();
            if (text.length > 2000) text = text.substr(0, 1997) + "...";

            console.log(text);
            message.channel.send(text);
        } else {
            console.log(`I could not find anything for "${args}"!`);
            message.channel.send(`I could not find anything for **${args}**!`);
        }
    } else if (command === "m64" || !message.content.startsWith(config.prefix) && args.trim().toLowerCase().startsWith("m64")) {

        let initialArgs = message.content.split(" ").slice(1).join(" ");
        if (!initialArgs) return message.channel.send("Please include something for me to find!");
        args = initialArgs.trim().replace(/\w\S*/g, function(txt) { return txt.charAt(0).toUpperCase() + txt.substr(1); }).replace(/\s/g, "_");

        let wiki = await wtf.fetch(args, { domain: "ukikipedia.net", path: "mediawiki/api.php" });

        if (wiki) {
            let text = wiki.text();
            if (text.length > 2000) text = text.substr(0, 1997) + "...";

            console.log(text);
            message.channel.send(text);
        } else {
            console.log(`I could not find anything for "${initialArgs}"!`);
            message.channel.send(`I could not find anything for **${initialArgs}**!`);
        }
    } else if (!message.content.startsWith(config.prefix) && args.startsWith("#")) {
        if (!args.substr(1)) return message.channel.send("Please include a hex color code!");
        let color = args.replace(/\s/g, "").toLowerCase();
        let isValidColor = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/i.test(color);

        if (isValidColor) {
            const hexImage = GenerateImage({
                w: 100,
                h: 100,
                bc: color
            }, false);

            svg2img(hexImage, function(error, buffer) {
                if (error) {
                    console.log(`There was an error creating a color image for ${color}!`);
                    message.channel.send(`There was an error creating a color image for **${color}**!`); 
                } else {
                    fs.writeFileSync("color.png", buffer);

                    console.log(`Sent color image for ${color}!`);
                    message.channel.send({ files: ["./color.png"] })
                        .catch(err => {
                            console.error(`An error occurred while trying to create a color image:\n${err}`);
                            return message.channel.send("**An error occurred while trying to create a color image:**```" + err + "```");
                    });
                }
            });
        } else {
            console.log(`${color} was not a valid hex color code.`);
            message.channel.send(`**${color}** is not a valid hex color code!`);
        }
    }
    // message.channel.send(args.replace(/_/g, " ").replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()).slice(0, -4))
});

// // user update event
// client.on("userUpdate", (oldUser, newUser) => {
//     // update private server icon with new avatar on change
//     if (oldUser.id === config.creatorid) {
//       let pserver = client.guilds.cache.find(g => g.id === "200458694704627712");
//       pserver.setIcon(newUser.avatarURL({ dynamic: true }))
//         .catch(error => console.error(error));
//     }
// });
