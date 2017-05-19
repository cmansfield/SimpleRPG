/**
 * Created by Chris on 5/19/2017.
 */

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

        this.hands = [null, null];
    }

    getName() { return this.name; }
    getLvl() { return this.lvl; }
    getStrength() { return this.str; }
    getDex() { return this.dex; }
    getSpeed() { return this.spd; }
    getHealth() { return this.health; }

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


let hero = new Person('Bob', 3, 2, 2, 20);
let bandit = new Person('Bandit', 2, 3);
hero.rightHandEquipt(new Sword());
hero.leftHandEquipt(new Sheild());
bandit.rightHandEquipt(new Sword());
console.log(hero.toString());
console.log(bandit.toString());

while(hero.getHealth() > 0 && bandit.getHealth() > 0) {

    if(bandit.isHit(hero.getSpeed())) {
        let atk = hero.attack();
        let diff = atk - bandit.defend();
        diff > 0 && bandit.takeDamage(diff);
    }
    if(bandit.getHealth() <= 0) continue;

    if(hero.isHit(bandit.getSpeed())) {
        let atk = bandit.attack();
        let diff = atk - hero.defend();
        diff > 0 && hero.takeDamage(diff);
    }
}

if(hero.getHealth() <= 0) { console.log('Game Over'); }
else {
    console.log('You Won!');
    let minExp = bandit.getLvl() * 30;
    let maxExp = bandit.getLvl() * 50;
    hero.gainExp(Math.floor(Math.random() * (maxExp - minExp) + minExp)) && console.log('Lvl up!');
}

console.log(hero.toString());