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
        this.img = '';
    }

    getName() { return this.name; }
    getLvl() { return this.lvl; }
    getStrength() { return this.str; }
    getDex() { return this.dex; }
    getSpeed() { return this.spd; }
    getHealth() { return this.health; }
    getAutonomy() { return this.isAutonomous; }
    getLocation() { return [this.x, this.y]; }
    getImg() { return this.img; }

    setLocation(x, y) { this.x = x; this.y = y; }
    setImage(img) { this.img = img; }

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



class I_PersonFac {
    constructor() {
        if(new.target === I_PersonFac) {
            throw new TypeError('Cannot construct Abstract instances directly');
        }

        if(
            this.generate === undefined
        ) { throw new TypeError('Must override required methods'); }
    }
}

class GoodPersonFac extends I_PersonFac {
    constructor() {
        super();
    }

    generate(loc, typeOfUnit = 'hero', name = 'Hero', lvl = 1) {
        let person = new Person(name, false, 3, 2, 2, 20);
        person.setLocation(loc[0], loc[1]);

        while(person.getLvl() < lvl) {
            person.gainExp(100);
        }

        if(typeOfUnit === 'hero') {
            person.setImage('img/People/lyn_bladelord_sword.png');
            person.rightHandEquipt(new Sword());
        }
        else {
            return null;
        }

        return person;
    }
}

class BadPersonFac extends I_PersonFac {
    constructor() {
        super();
    }

    generate(loc, typeOfUnit = 'axe', name = 'Bandit', lvl = 1) {
        let person = new Person(name, true, 2, 3);
        person.setLocation(loc[0], loc[1]);

        while(person.getLvl() < lvl) {
            person.gainExp(100);
        }

        person.gainExp = (exp) => {};

        if(typeOfUnit === 'axe') {
            person.setImage('img/People/bandit_axe.png');
            person.leftHandEquipt(new Axe());
        }
        else {
            return null;
        }

        return person;
    }
}

class AbsFacPerson {
    static generate(affiliation = 'neutral') {
        if(affiliation === 'good') {
            return new GoodPersonFac();
        }

        if(affiliation === 'bad') {
            return new BadPersonFac();
        }

        if(affiliation === 'neutral') { return null; }

        return null;
    }
}




// ************ Populate Page ************

var canvas = document.getElementById('main'),
    ctx = canvas.getContext('2d'),
    layer1 = document.getElementById('layer1'),
    ctxLayer1 = layer1.getContext('2d'),
    output = document.getElementById('entityInfo'),
    imgMap = new Image(),
    imgs = [];

var selectedCoords,
    hoverCoords,
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
    goodEntityFac = AbsFacPerson.generate('good'),
    badEntityFac = AbsFacPerson.generate('bad'),
    entities = {
        enemies: [
            badEntityFac.generate([17,2], 'axe', 'Bandit', 4),
            badEntityFac.generate([15,2]),
            badEntityFac.generate([18,4]),
            badEntityFac.generate([17,5]),
            badEntityFac.generate([12,6])
        ],
        allies: [
            goodEntityFac.generate([3,22])
        ]
    };


imgMap.src = 'img/SimpleRPGmap.png';

for(let prop in entities) {
    if(entities.hasOwnProperty(prop)) {
        for(let entity in entities[prop]) {
            let img = new Image();
            img.src = entities[prop][entity].getImg();
            imgs.push(img);
        }
    }
}


// ************ Functions ************

function init() {
    ctx.drawImage(imgMap, 0, 0, worldWidth, worldHeight);

    ctxLayer1.clearRect(0, 0, worldWidth, worldHeight);
    let i = 0;
    for(let prop in entities) {
        if (entities.hasOwnProperty(prop)) {
            for(let entity in entities[prop]) {
                let loc = entities[prop][entity].getLocation();
                ctxLayer1.drawImage(imgs[i++], loc[0] * tileWidth, loc[1] * tileHeight, 32, 32);
            }
        }
    }
};

function start() {

}

function isEqual(array1, array2) {

    if(!array1 || !array2) return false;
    if(array1.length != array2.length) return false;

    for(let coord in array1) {
        if(array1[coord] != array2[coord]) return false;
    }

    return true;
}

layer1.onmousemove = (evt) => {

    let currentHoverCoords = getCoords(evt.layerX, evt.layerY);

    if(isEqual(hoverCoords, currentHoverCoords)) return;

    hoverCoords = currentHoverCoords;

    let entity = entities['enemies'].filter((emy) => isEqual(emy.getLocation(), hoverCoords));
    if(!entity.length) entity = entities['allies'].filter((ally) => isEqual(ally.getLocation(), hoverCoords));

    //entity.length && console.log(entity[0].toString());
    if(entity.length) { output.innerHTML = entity[0].toString(); }
    else { output.innerHTML = ' '; }
};

layer1.onclick = (evt) => {
    selectedCoords = getCoords(evt.layerX, evt.layerY);

    console.log(selectedCoords);
    console.log(VALID_PATH_MAP[selectedCoords[1]][selectedCoords[0]] ? 'Is Valid' : 'Not Valid');
};


init();
start();