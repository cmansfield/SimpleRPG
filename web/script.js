class I_Item {
    constructor() {
        if(new.target === I_Item) {
            throw new TypeError('Cannot construct Abstract instances directly');
        }

        if(
            this.atk === undefined
            || this.def === undefined
            || this.getName === undefined
            || this.getValue == undefined
        ) { throw new TypeError('Must override required methods'); }
    }
}

class Sword extends I_Item {
    constructor() {
        super();
        this.attack = 5;
        this.defence = 0;
        this.name = 'Short Sword';
        this.value = 23;
    }

    atk() { return this.attack; }
    def() { return this.defence; }
    getName() { return this.name; }
    getValue() { return this.value; }
}

class Axe extends I_Item {
    constructor() {
        super();
        this.attack = 4;
        this.defence = 0;
        this.name = 'Iron Axe';
        this.value = 18;
    }

    atk() { return this.attack; }
    def() { return this.defence; }
    getName() { return this.name; }
    getValue() { return this.value; }
}

class Sheild extends I_Item {
    constructor() {
        super();
        this.attack = 0;
        this.defence = 3;
        this.name = 'Small Sheild';
        this.value = 12;
    }

    atk() { return this.attack; }
    def() { return this.defence; }
    getName() { return this.name; }
    getValue() { return this.value; }
}


class Person {
    constructor(
        name,
        isAutonomous = false,
        str = 1,
        dex = 1,
        spd = 1,
        health = 10,
        strProb = .6,
        dexProb = .6,
        spdProb = .6
    ) {
        this.name = name;
        this.str = str;
        this.dex = dex;
        this.spd = spd;
        this.strProb = strProb;
        this.dexProb = dexProb;
        this.spdProb = spdProb;
        this.maxHealth = health;
        this.health = health;
        this.lvl = 1;
        this.exp = 0;
        this.isAutonomous = isAutonomous;
        this.x = 0;
        this.y = 0;

        this.hands = [null, null];
        this.img = null;
    }

    getName() { return this.name; }
    getLvl() { return this.lvl; }
    getStrength() { return this.str; }
    getDex() { return this.dex; }
    getSpeed() { return this.spd; }
    getHealth() { return this.health; }
    getAutonomy() { return this.isAutonomous; }
    getLocation() { return [this.x, this.y]; }
    getImg() { return ''; }

    setLocation(x, y) { this.x = x; this.y = y; }

    attack() {
        let dmg = this.str;

        for(let item in this.hands) {
            this.hands[item] instanceof I_Item && (dmg += this.hands[item].atk());
        }

        return dmg;
    }

    defend() {
        let def = this.dex;

        for(let item in this.hands) {
            this.hands[item] instanceof I_Item && (def += this.hands[item].def());
        }

        return def;
    }

    isHit(enmySpd) {
        const BASE_HIT_PERCENT = .8;
        let hitPercent = BASE_HIT_PERCENT + (enmySpd - this.spd) / 10;

        return Math.random() < hitPercent;
    }

    takeDamage(dmg) {
        this.health -= dmg;
        return this.health <= 0;
    }

    rightHandEquipt(item) {
        if(!item instanceof I_Item) {
            throw new TypeError('Can only equipt items');
        }

        this.hands[1] = item;
    }

    leftHandEquipt(item) {
        if(!item instanceof I_Item) {
            throw new TypeError('Can only equipt items');
        }

        this.hands[0] = item;
    }

    gainExp(exp) {
        const BASE_EXP_BOOST = 100;
        const PERCENT_BOOST = .2;
        let limit = this.lvl * BASE_EXP_BOOST
            + ((this.lvl - 1) * BASE_EXP_BOOST) * PERCENT_BOOST;

        this.exp += exp;

        if(this.exp < limit) { return false; }

        Math.random() <= this.strProb && ++this.str;
        Math.random() <= this.dexProb && ++this.dex;
        Math.random() <= this.spdProb && ++this.spd;

        this.exp -= limit;
        ++this.lvl;

        this.gainExp(0);
        return true;
    }

    toString() {
        return this.name
            + ' lvl:' + this.lvl + ' exp:' + this.exp
            + '\nhealth: ' + this.health + '/' + this.maxHealth
            + '\nstr: ' + this.str
            + '\ndex: ' + this.dex
            + '\nspd: ' + this.spd
            + '\nattack: ' + this.attack()
            + '\ndefense: ' + this.defend();
    }
}

class Bandit extends Person {
    constructor(lvl = 1) {
        super('Bandit', true, 2, 3);
        this.leftHandEquipt(new Axe());
    }

    getImg() { return 'img/People/bandit_axe.gif'; }

    gainExp(exp) {}
}




// ************ Populate Page ************

var canvas = document.getElementById("main"),
    ctx = canvas.getContext("2d"),
    layer1 = document.getElementById("layer1"),
    ctxLayer1 = layer1.getContext("2d"),
    imgMap = new Image(),
    imgs = [];

var selectedCoords = 0,
    tileWidth = 32,
    tileHeight = 32,
    worldWidth = 800,
    worldHeight = 800,
    numTilesX = worldWidth / tileWidth,
    numTilesY = worldHeight / tileHeight,
    getCoords = (x, y) => {
        var xCoord = Math.floor(x / tileWidth),
            yCoord = Math.floor(y / tileHeight);

        return [xCoord, yCoord];
    },
    VALID_PATH_MAP = [
        [0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1],
        [0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1],
        [0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1],
        [0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1],
        [0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1],
        [0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1]
    ],
    enemies = [
        new Bandit(4),
        new Bandit(),
        new Bandit(),
        new Bandit(),
        new Bandit()
    ];

enemies[0].setLocation(17, 2);
enemies[1].setLocation(15, 2);
enemies[2].setLocation(18, 4);
enemies[3].setLocation(17, 5);
enemies[4].setLocation(12, 6);

imgMap.src = 'img/SimpleRPGmap.png';

for(let emy in enemies) {
    let img = new Image();
    img.src = enemies[emy].getImg();
    imgs.push(img);
}


function init() {
    ctx.drawImage(imgMap, 0, 0, 800, 800);

    ctxLayer1.clearRect(0, 0, worldWidth, worldHeight);
    for(let emy in enemies) {
        let loc = enemies[emy].getLocation();
        ctxLayer1.drawImage(imgs[emy], loc[0] * tileWidth, loc[1] * tileHeight, 32, 32);
    }
}




canvas.onclick = (evt) => {
    selectedCoords = getCoords(evt.layerX, evt.layerY);

    console.log(selectedCoords);
    console.log(VALID_PATH_MAP[test[1]][test[0]] ? 'Is Valid' : 'Not Valid');
};


init();