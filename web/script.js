
const X = 0, Y = 1;
var UnitType = Object.freeze({
    HERO: 1,
    AXE: 2
});
var AffiliationEnum = Object.freeze({
    GOOD: 0,
    NEUTRAL: 1,
    BAD: 2
});
var CanvasLayers = Object.freeze({
    ALL: 1,
    BACKGROUND: 2,
    ENTITIES: 3,
    FOG: 4,
    MENU: 5
});
var EntityState = Object.freeze({
    ACTIVE: 1,
    INACTIVE: 2
});


class I_CombatItem {
    constructor() {
        if(new.target === I_CombatItem) {
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

class Sword extends I_CombatItem {
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

class Axe extends I_CombatItem {
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

class Sheild extends I_CombatItem {
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
        this.state = EntityState.ACTIVE;
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
    getState() { return this.state; }

    setLocation(x, y) { this.x = x; this.y = y; }
    setImage(img) { this.img = img; }
    setState(state) { this.state = state; }

    attack() {
        let dmg = this.str;

        for(let item in this.hands) {
            this.hands[item] instanceof I_CombatItem && (dmg += this.hands[item].atk());
        }

        return dmg;
    }

    defend() {
        let def = this.dex;

        for(let item in this.hands) {
            this.hands[item] instanceof I_CombatItem && (def += this.hands[item].def());
        }

        return def;
    }

    isHit(enmySpd) {
        const BASE_HIT_PERCENT = .8;
        const CONVT_TO_PERCENT = 10;
        let hitPercent = BASE_HIT_PERCENT + (enmySpd - this.spd) / CONVT_TO_PERCENT;

        return Math.random() < hitPercent;
    }

    takeDamage(dmg) {
        this.health -= dmg;
        return this.health <= 0;
    }

    rightHandEquipt(item) {
        if(!item instanceof I_CombatItem) {
            throw new TypeError('Can only equipt combat items');
        }

        this.hands[1] = item;
    }

    leftHandEquipt(item) {
        if(!item instanceof I_CombatItem) {
            throw new TypeError('Can only equipt combat items');
        }

        this.hands[0] = item;
    }

    gainExp(exp) {
        const BASE_EXP_BOOST = 100;
        const PERCENT_BOOST = .2;

        // Add a 20% increase to exp requirement
        // for each new level
        let limit = this.lvl * BASE_EXP_BOOST
            + ((this.lvl - 1) * BASE_EXP_BOOST) * PERCENT_BOOST;

        this.exp += exp;

        if(this.exp < limit) { return false; }

        Math.random() <= this.strProb && ++this.str;
        Math.random() <= this.dexProb && ++this.dex;
        Math.random() <= this.spdProb && ++this.spd;
        ++this.maxHealth;

        this.exp -= limit;
        ++this.lvl;

        // Continue to recursively call this
        // funciton until we've leveled up all
        // we can with the earned exp
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

    generate(loc, typeOfUnit = UnitType.HERO, lvl = 1, name = 'Hero') {
        let person = new Person(name, false, 3, 2, 2, 20);
        person.setLocation(loc[X], loc[Y]);

        while(person.getLvl() < lvl) {
            person.gainExp(100);
        }

        if(typeOfUnit == UnitType.HERO) {
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

    generate(loc, typeOfUnit = UnitType.AXE, lvl = 1, name = 'Bandit') {
        let person = new Person(name, true, 2, 3);
        person.setLocation(loc[X], loc[Y]);

        while(person.getLvl() < lvl) {
            person.gainExp(100);
        }

        person.gainExp = (exp) => {};

        if(typeOfUnit == UnitType.AXE) {
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
    static generate(affiliation = AffiliationEnum.NEUTRAL) {
        if(affiliation == AffiliationEnum.GOOD) {
            return new GoodPersonFac();
        }

        if(affiliation == AffiliationEnum.BAD) {
            return new BadPersonFac();
        }

        if(affiliation == AffiliationEnum.NEUTRAL) { return null; }

        return null;
    }
}


class I_GameState {
    constructor() {
        if(new.target === I_GameState) {
            throw new TypeError('Cannot construct Abstract instances directly');
        }

        if(
            this.startAction === undefined
            && this.getAffiliation === undefined
            && this.hasRemainingActiveEntities === undefined
            && this.resetEntityStatus === undefined
        ) { throw new TypeError('Must override required methods'); }
    }
}

class PlayerState extends I_GameState {
    constructor(entities, affiliation = AffiliationEnum.GOOD) {
        super();
        this.affiliation = affiliation;
        this.entities = entities;
    }

    getAffiliation() { return this.affiliation; }

    startAction(gameContext) {

        if(gameContext instanceof GameContext) {
            gameContext.setState(this);
        }

        layer2.onclick = playerClickEvent;
    }

    hasRemainingActiveEntities() {

        for(let entity in this.entities) {
            if(this.entities[entity].getState() == EntityState.ACTIVE) return true;
        }

        return false;
    }

    resetEntityStatus() {

        for(let entity in this.entities) {
            this.entities[entity].setState(EntityState.ACTIVE);
        }
    }
}

class NpcState extends I_GameState {
    constructor(entities, affiliation = AffiliationEnum.BAD) {
        super();
        this.affiliation = affiliation;
        this.entities = entities;
    }

    getAffiliation() { return this.affiliation; }

    startAction(gameContext) {
        if(gameContext instanceof GameContext) {
            gameContext.setState(this);
        }

        layer2.onclick = (evt) => {};

        for(let entity in this.entities) {
            entity = this.entities[entity];
            let entityMoves = getEntityMoves(entity.getLocation(), entity.getSpeed()),
                selectedMove = Math.floor(
                    Math.random() * (entityMoves.moves.length - 1)
                );

            while(findEntity(entityMoves.moves[selectedMove])) {
                selectedMove = (selectedMove + 1) % entityMoves.moves.length;
            }

            entity.setLocation(
                entityMoves.moves[selectedMove][X],
                entityMoves.moves[selectedMove][Y]
            );
            render(CanvasLayers.ENTITIES);
        }
    }

    hasRemainingActiveEntities() {

        if(!this.entities) return false;

        for(let entity in this.entities) {
            if(this.entities[entity].getState() == EntityState.ACTIVE) return true;
        }

        return false;
    }

    resetEntityStatus() {

        for(let entity in this.entities) {
            this.entities[entity].setState(EntityState.ACTIVE);
        }
    }
}

class GameContext {
    constructor() {
        this.state = null;
    }

    setState(state) {
        if(state instanceof I_GameState) {
            this.state = state;
        }
    }

    getState() {
        return this.state;
    }
}


// ************ Populate Page ************

const tileWidth = 32,
    tileHeight = 32,
    worldWidth = 800,
    worldHeight = 800;

var canvas = document.getElementById('main'),
    ctx = canvas.getContext('2d'),
    layer1 = document.getElementById('layer1'),
    ctx1 = layer1.getContext('2d'),
    layer2 = document.getElementById('layer2'),
    ctx2 = layer2.getContext('2d'),
    output = document.getElementById('entityInfo'),
    imgMap = new Image();

var selectedUnit,
    selectedUnitsMoves,
    selectedCoords,
    hoverCoords,
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
    goodEntityFac = AbsFacPerson.generate(AffiliationEnum.GOOD),
    badEntityFac = AbsFacPerson.generate(AffiliationEnum.BAD),
    entities = {
        enemies: [
            badEntityFac.generate([17,2], UnitType.AXE, 4, 'Bandit'),
            badEntityFac.generate([15,2]),
            badEntityFac.generate([18,4]),
            badEntityFac.generate([17,5]),
            badEntityFac.generate([12,6])
        ],
        allies: [
            goodEntityFac.generate([3,22])
        ]
    };

let gameContext = new GameContext(),
    states = {
        0: new PlayerState(entities.allies),
        1: new NpcState(null, AffiliationEnum.NEUTRAL),
        2: new NpcState(entities.enemies)
    };

// ************ Functions ************

function init() {
    imgMap.src = 'img/SimpleRPGmap.png';
    ctx.drawImage(imgMap, 0, 0, worldWidth, worldHeight);

    render();
};

function render(layer = CanvasLayers.ALL) {

    if(layer == CanvasLayers.ALL || layer == CanvasLayers.ENTITIES) {
        ctx1.clearRect(0, 0, worldWidth, worldHeight);
        for(let prop in entities) {
            if (entities.hasOwnProperty(prop)) {
                for(let entity in entities[prop]) {
                    let loc = entities[prop][entity].getLocation(),
                        img = new Image();

                    img.src = entities[prop][entity].getImg();
                    ctx1.drawImage(
                        img,
                        loc[X] * tileWidth, loc[Y] * tileHeight,
                        32,
                        32
                    );
                }
            }
        }
    }

    if(layer == CanvasLayers.ALL || layer == CanvasLayers.FOG) {
        ctx2.clearRect(0, 0, worldWidth, worldHeight);
        ctx2.globalAlpha = 0.4;
    }
}

function start() {

    states[AffiliationEnum.GOOD].startAction(gameContext);
}

function update() {

    if(gameContext.getState().hasRemainingActiveEntities()) { return; }

    gameContext.getState().resetEntityStatus();

     do {
        states[
        (gameContext.getState().getAffiliation() + 1)
        % Object.keys(states).length
            ].startAction(gameContext);
    } while(gameContext.getState() instanceof NpcState);
}

function isEqual(array1, array2) {

    if(!array1 || !array2) return false;
    if(array1.length != array2.length) return false;

    for(let coord in array1) {
        if(array1[coord] != array2[coord]) return false;
    }

    return true;
}

function getNeighbors(loc) {
    let offsets = [[1,0],[0,1],[-1,0],[0,-1]],
        neighbors = [];

    if(!loc) return [];

    for(let offset in offsets) {
        let pos = offsets[offset];

        for(let i in loc) pos[i] += loc[i];

        if(
            pos[X] < numTilesX
            && pos[Y] < numTilesY
            && pos[X] >= 0
            && pos[Y] >= 0
        ) { VALID_PATH_MAP[pos[Y]][pos[X]] && neighbors.push(pos); }
    }

    return neighbors;
}

function showEntityMoves(validMoves, context) {

    context.fillStyle = '#ff5b62';

    for(let i = 0; i < numTilesX; ++i) {
        for(let j = 0; j < numTilesY; ++j) {
            if(!validMoves['movesSet'].has([i,j].toString())) {
                context.fillRect(
                    (i * tileWidth) + 1,
                    (j * tileHeight) + 1,
                    tileWidth, tileHeight
                );
            }
        }
    }
}

function getEntityMoves(coords, speed) {
    let frontier = [],
        visited = new Set(),
        moves = [],
        boundary = new Set(),
        current,
        isInRange = (start, end, range) => {
            let x = start[X],
                y = start[Y];

            x = Math.abs(x - end[X]);
            y = Math.abs(y - end[Y]);
            range -= x;

            return (x >= 0 && y <= range);
        };

    render(CanvasLayers.FOG);

    frontier.push(coords);
    visited.add(coords.toString());

    while(frontier.length > 0) {
        current = frontier.shift();

        while(current && !isInRange(coords, current, speed)) {
            current = frontier.shift();
        }

        if(current) {
            boundary.add(current.toString());
            moves.push(current);
        }

        let neighbors = getNeighbors(current);
        for(let next in neighbors) {
            if(visited.has(neighbors[next].toString())) continue;

            frontier.push(neighbors[next]);
            visited.add(neighbors[next].toString());
        }
    }

    return {
        moves: moves,
        movesSet: boundary
    };
}

function findEntity(loc) {
    let entity = [];

    for(let i in entities) {
        if(entities.hasOwnProperty(i)) {
            entity.push(entities[i].reduce(
                (a, b) => (isEqual(b.getLocation(), loc) ? b : a),
                null
            ));
        }
    }

    // Remove null values
    entity = entity.filter((a) => a);

    if(entity.length) { return entity[0]; }

    return null;
}

function removeEntity(entityToRem) {

    for(let prop in entities) {
        if(entities.hasOwnProperty(prop)) {
            entities[prop] = entities[prop].filter((entity) => {
                return entity !== entityToRem;
            });
        }
    }
}

function engage(attacker, defender) {
    if(defender.isHit(attacker.getSpeed())) {
        let diff = attacker.attack() - defender.defend();
        diff > 0 && defender.takeDamage(diff);
    }

    if(defender.getHealth() <= 0) {
        return;
    }

    if(attacker.isHit(defender.getSpeed())) {
        let diff = defender.attack() - attacker.defend();
        diff > 0 && attacker.takeDamage(diff);
    }
}

function fight(attacker, defender) {
    let giveRewards = (a, b) => {
        let giveReward = (unit1, unit2) => {
            const BASE_EXP = 50,
                BONUS_EXP = 20,
                NONWIN_EXP = 10
            if(unit1.getHealth() <= 0) {
                let lvlDiff = unit1.getLvl() - unit2.getLvl(),
                    exp = BASE_EXP;
                    exp += (lvlDiff > 0)
                        ? BONUS_EXP * lvlDiff
                        : 0;

                unit2.gainExp(exp);
            }
            else { unit1.gainExp(NONWIN_EXP); }
        }

        giveReward(a, b);
        giveReward(b, a);
    };

    engage(attacker, defender);

    giveRewards(attacker, defender);

    // TODO - Remove me
    console.log(attacker.toString());
    console.log(defender.toString());
    console.log('');

    attacker.getHealth() <= 0 && removeEntity(attacker);
    defender.getHealth() <= 0 && removeEntity(defender);

    if(isGameOver()) {
        layer2.onclick = () => {};

        // TODO - Remove me
        console.log('Game Over');
    }
}

function isGameOver() {
     return !entities.allies.length || !entities.enemies.length;
}

function playerClickEvent(evt) {
        let currentSelectedCoords = getCoords(evt.layerX, evt.layerY),
            moveUnit = (loc) => {
            selectedUnit.setLocation(loc[X], loc[Y]);
            selectedCoords = [];
            render();
        };

        if(isEqual(selectedCoords, currentSelectedCoords)) {
            render(CanvasLayers.FOG);
            selectedCoords = [];
            selectedUnit = null;
            return;
        }
        selectedCoords = currentSelectedCoords;
        let entity = findEntity(selectedCoords);

        // If a unit has been selected and a new tile
        // has been clicked then move the unit to that
        // location
        if(
            selectedUnit
            && selectedUnitsMoves
            && selectedUnitsMoves['movesSet'].has(selectedCoords.toString()))
        {
            // If any enemy was selected then we need to
            // attack it
            if(entity) {
                let tilesNextToEntity = getNeighbors(selectedCoords);

                if(!tilesNextToEntity.length) return;

                for(let tile in tilesNextToEntity) {
                    if(selectedUnitsMoves['movesSet'].has(tilesNextToEntity[tile].toString())) {
                        selectedUnit.setLocation(
                            tilesNextToEntity[tile][X],
                            tilesNextToEntity[tile][Y]);
                        selectedCoords = [];
                        break;
                    }
                }

                fight(selectedUnit, entity);
                render();
                selectedUnit.setState(EntityState.INACTIVE);
                selectedUnit = null;
                update();

                return;
            }

            selectedUnit.setState(EntityState.INACTIVE);
            moveUnit(selectedCoords);
            selectedUnit = null;
            update();
            return;
        }
        else if(
            selectedUnit
            && selectedUnitsMoves
            && !selectedUnitsMoves['movesSet'].has(selectedCoords.toString()))
        {
            // If selected outside of the unit's boundary
            // then no-op the unit and rerender the map
            moveUnit(selectedUnit.getLocation());
            selectedUnit = null;
            return;
        }

        if(entity && entity.getState() == EntityState.ACTIVE) {
            selectedUnitsMoves = getEntityMoves(
                selectedCoords,
                entity.getSpeed() + 3
            );
            showEntityMoves(selectedUnitsMoves, ctx2);
        }

        if(!entity) selectedUnit = null;
        else if(!selectedUnit && entity.getState() == EntityState.ACTIVE) selectedUnit = entity;
}

layer2.onmousemove = (evt) => {

    let currentHoverCoords = getCoords(evt.layerX, evt.layerY);

    if(isEqual(hoverCoords, currentHoverCoords)) return;
    hoverCoords = currentHoverCoords;

    let entity = findEntity(hoverCoords);

    //entity.length && console.log(entity[0].toString());
    if(entity) { output.innerHTML = entity.toString(); }
    else { output.innerHTML = ' '; }
};

layer2.onclick = playerClickEvent;
init();
start();


// ********** TODO **********
// Prevent allied units from attacking each other
// Add AI to enemies
// Add icon animations
// Add a way to win the game
// Balance the fighting better
// Add healing
// Add notifications when something happens
// Prevent player from moving enemy units
// Add non-combat items
// Add a lvl up banner
// Add a menu for actions