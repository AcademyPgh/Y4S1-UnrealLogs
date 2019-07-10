const fs = require('fs');
const readline = require('readline');

const readInterface = readline.createInterface({
    input: fs.createReadStream('./log.log', {encoding: 'utf16le'}),
    output: null,
    console: false,
});

let match = {
    info: {},
    game: {},
    players: [],
    actions: [],
    map: {}
}

readInterface.on('line', function(line) {
    let values = line.split('\t')
    switch(values[1])
    {
        case 'info':
            match.info[values[2]] = values[3];
            break;
        case 'map':
            match.map[values[2]] = values[3];
            break;
        case 'game':
            match.game[values[2]] = values[3];
            break;
        case 'player':
            playerInfo(values);
            break;
        case 'item_get':
            match.actions.push({
                time: values[0],
                type: 'item pickup',
                player: values[3],
                item: values[2]
            });
            break;
        case 'kill':
            match.actions.push({
                time: values[0],
                type: 'kill',
                player: values[2],
                weapon: values[3],
                victim: values[4],
                victim_weapon: values[5],
                death_type: values[6]
            });
            break;
        case 'suicide':
            match.actions.push({
                time: values[0],
                type: 'suicide',
                player: values[2],
                weapon: values[3],
                death_type: values[4]
            })
        case 'stat_player':
            playerStats(values);
            break;
    }
});

readInterface.on('close', function() {
    console.log(match);
    fs.writeFileSync('log.json', JSON.stringify(match)); 
});

const playerStats = (logRow) => {
    let stat = logRow[2];
    let id = logRow[3];
    let value = logRow[4];
    let playerIndex = -1;
    match.players.forEach((row, index) => {
        if(id === row.id)
        {
            playerIndex = index;
        }
    });
    if(playerIndex === -1)
    {
        // something went wrong finding the player
        // invalid log file?
    }
    else
    {
        match.players[playerIndex][stat] = value;
    }
}

const playerInfo = (logRow) => {
    let player = {};
    switch(logRow[2])
    {
        case 'Rename':
        case 'Connect':
            player.id = logRow[4];
            player.name = logRow[3];
            break;
        case 'IsABot':
            player.id = logRow[3];
            player.isabot = logRow[4];
            break;
    }
    let playerIndex = -1;
    match.players.forEach((row, index) => {
        if(player.id === row.id)
        {
            playerIndex = index;
        }
    });
    if(playerIndex === -1)
    {
        match.players.push(player);
    }
    else
    {
        match.players[playerIndex] = {...match.players[playerIndex], ...player};
    }
}

