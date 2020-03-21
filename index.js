const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json');
const apikey = config.apikey;
const prefix = '!';
const fetch = require('node-fetch');

client.on('ready', () => {
    console.log('Started the bot');
});

client.on('message', async message => {
    if (message.author.bot) return;
    if (message.content.indexOf(prefix) !== 0) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (command === 'coronavirus') {
        let thing = args[0];
        if(!thing) {
            return message.channel.send('Either `status` or `in`')
        }
        if(thing === 'status') {
            fetch("https://coronavirus-monitor.p.rapidapi.com/coronavirus/worldstat.php", {
                "method": "GET",
                "headers": {
                    "x-rapidapi-host": "coronavirus-monitor.p.rapidapi.com",
                    "x-rapidapi-key": apikey
                }
            }).then(response => response.json().then(data => {
                console.log(data);
                const embed = new Discord.RichEmbed()
                    .setTitle("Information about The World's situation")
                    .setAuthor('RapidAPI', 'https://rapidapi-prod-apis.s3.amazonaws.com/d85cef83-6e37-446c-9be3-b49ff5215b3a_medium', 'https://rapidapi.com/astsiatsko/api/coronavirus-monitor/endpoints')
                    .setColor(0x00AE86)
                    .setDescription('Data taken from worldometers and cdc.gov')
                    .addField('Total cases', data.total_cases, true)
                    .addField('Total deaths', data.total_deaths, true)
                    .addField('\u200B', '\u200B', true)
                    .addField('New cases', data.new_cases, true)
                    .addField('New deaths', data.new_deaths, true)
                    .addField('\u200B', '\u200B', true)
                    .setFooter('Last updated ' + data.statistic_taken_at)

                message.channel.send(embed);
            })).catch(err => { console.log(err); });
        } else if (thing === 'in') {
            let countries = args.slice(1).join(" ");
            if (!countries) {
                return message.channel.send('You need to pass a country.');
            } else if (countries) {
                fetch("https://coronavirus-monitor.p.rapidapi.com/coronavirus/latest_stat_by_country.php?country=" + countries, {
                    "method": "GET",
                    "headers": {
                        "x-rapidapi-host": "coronavirus-monitor.p.rapidapi.com",
                        "x-rapidapi-key": apikey
                    }
                }).then(response => response.json().then(data => {
                    console.log(data);
                    let country_stat = data.latest_stat_by_country;
                    for(let i = 0; i<country_stat.length;i++) {
                        console.log(country_stat[i]);
                        function fixNoValues(id) {
                            if (id === "") {
                                return "0";
                            } else {
                                return id
                            }
                        }
                        const embed = new Discord.RichEmbed()
                            .setTitle(`Information about ${country_stat[i].country_name}'s situation`)
                            .setAuthor('RapidAPI', 'https://rapidapi-prod-apis.s3.amazonaws.com/d85cef83-6e37-446c-9be3-b49ff5215b3a_medium', 'https://rapidapi.com/astsiatsko/api/coronavirus-monitor/endpoints')
                            .setColor(0x00AE86)
                            .setDescription('Data taken from worldometers and cdc.gov')
                            .addField('Total cases', fixNoValues(country_stat[i].total_cases), true)
                            .addField('Total deaths', fixNoValues(country_stat[i].total_deaths), true)
                            .addField('\u200B', '\u200B', true)
                            .addField('New cases', fixNoValues(country_stat[i].new_cases), true)
                            .addField('New deaths', fixNoValues(country_stat[i].new_deaths), true)
                            .addField('\u200B', '\u200B', true)
                            .setFooter('Last updated ' + country_stat[i].record_date)
                            .setThumbnail('https://www.countries-ofthe-world.com/flags-normal/flag-of-' + country_stat[i].country_name.split(' ').join('-') + '.png');

                        message.channel.send(embed);
                    }
                })).catch(err => { console.log(err); });
            }
        }
    }
});

client.login(config.token);