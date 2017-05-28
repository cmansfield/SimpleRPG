
//import {Person} from './classes/entities.js';


const X = 0, Y = 1,
    tileWidth = 32,
    tileHeight = 32,
    worldWidth = 800,
    worldHeight = 800,
    idleAnimationDuration = 800,
    UnitType = Object.freeze({
        HERO: 1,
        AXE: 2
    }),
    AffiliationEnum = Object.freeze({
        GOOD: 0,
        NEUTRAL: 1,
        BAD: 2
    }),
    CanvasLayers = Object.freeze({
        ALL: 1,
        BACKGROUND: 2,
        ENTITIES: 3,
        FOG: 4,
        MENU: 5
    }),
    EntityState = Object.freeze({
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
        this._attack = 5;
        this._defence = 0;
        this._name = 'Short Sword';
        this._value = 23;
    }

    atk() { return this._attack; }
    def() { return this._defence; }
    getName() { return this._name; }
    getValue() { return this._value; }
}

class Axe extends I_CombatItem {
    constructor() {
        super();
        this._attack = 4;
        this._defence = 0;
        this._name = 'Iron Axe';
        this._value = 18;
    }

    atk() { return this._attack; }
    def() { return this._defence; }
    getName() { return this._name; }
    getValue() { return this._value; }
}

class Shield extends I_CombatItem {
    constructor() {
        super();
        this._attack = 0;
        this._defence = 3;
        this._name = 'Small Shield';
        this._value = 12;
    }

    atk() { return this._attack; }
    def() { return this._defence; }
    getName() { return this._name; }
    getValue() { return this._value; }
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
        this._name = name;
        this._str = str;
        this._dex = dex;
        this._spd = spd;
        this._strProb = strProb;
        this._dexProb = dexProb;
        this._spdProb = spdProb;
        this._maxHealth = health;
        this._health = health;
        this._lvl = 1;
        this._exp = 0;
        this._isAutonomous = isAutonomous;
        this._x = 0;
        this._y = 0;

        this._hands = [null, null];
        this._sprite = null;
        this._state = EntityState.ACTIVE;
    }

    getName() { return this._name; }
    getLvl() { return this._lvl; }
    getStrength() { return this._str; }
    getDex() { return this._dex; }
    getSpeed() { return this._spd; }
    getHealth() { return this._health; }
    getAutonomy() { return this._isAutonomous; }
    getLocation() { return [this._x, this._y]; }
    getSprite() { return this._sprite; }
    getState() { return this._state; }

    setSprite(sprite) { this._sprite = sprite; }
    setState(state) { this._state = state; }
    setLocation(x, y) { this._x = x; this._y = y; }

    attack() {
        let dmg = this._str;

        for(let item of this._hands) {
            item instanceof I_CombatItem && (dmg += item.atk());
        }

        return dmg;
    }

    defend() {
        let def = this._dex;

        for(let item of this._hands) {
            item instanceof I_CombatItem && (def += item.def());
        }

        return def;
    }

    isHit(enmySpd) {
        const BASE_HIT_PERCENT = .8;
        const CONVT_TO_PERCENT = 10;
        let hitPercent = BASE_HIT_PERCENT + (enmySpd - this._spd) / CONVT_TO_PERCENT;

        return Math.random() < hitPercent;
    }

    takeDamage(dmg) {
        this._health -= dmg;
        return this._health <= 0;
    }

    rightHandEquipt(item) {
        if(!item instanceof I_CombatItem) {
            throw new TypeError('Can only equipt combat items');
        }

        this._hands[1] = item;
    }

    leftHandEquipt(item) {
        if(!item instanceof I_CombatItem) {
            throw new TypeError('Can only equipt combat items');
        }

        this._hands[0] = item;
    }

    gainExp(exp) {
        const BASE_EXP_BOOST = 100;
        const PERCENT_BOOST = .2;

        // Add a 20% increase to exp requirement
        // for each new level
        let limit = this._lvl * BASE_EXP_BOOST
            + ((this._lvl - 1) * BASE_EXP_BOOST) * PERCENT_BOOST;

        this._exp += exp;

        if(this._exp < limit) { return false; }

        Math.random() <= this._strProb && ++this._str;
        Math.random() <= this._dexProb && ++this._dex;
        Math.random() <= this._spdProb && ++this._spd;
        ++this._maxHealth;

        this._exp -= limit;
        ++this._lvl;

        // Continue to recursively call this
        // funciton until we've leveled up all
        // we can with the earned exp
        this.gainExp(0);
        return true;
    }

    toString() {
        return this._name
            + ' lvl:' + this._lvl + ' exp:' + this._exp
            + '\nhealth: ' + this._health + '/' + this._maxHealth
            + '\nstr: ' + this._str
            + '\ndex: ' + this._dex
            + '\nspd: ' + this._spd
            + '\nattack: ' + this.attack()
            + '\ndefense: ' + this.defend();
    }
}


class Sprite {
    constructor(imgSrc, spriteWidth, spriteHeight, context) {
        this._img = new Image();
        this._img.src = imgSrc;
        this._width = spriteWidth;
        this._height = spriteHeight;
        this._ctx = context;
    }

    render(loc) {

        let context = this._ctx,
            img = this._img,
            w = this._width,
            h = this._height,
            drawImg = (function() {
                return function () {
                    context.drawImage(
                        img,
                        0,                          // Source x
                        0,                          // Source y
                        w,                          // Source width
                        h,                          // Source height
                        loc[X] * tileWidth + Sprite.idle[Sprite.tick][X],         // Destination x
                        loc[Y] * tileHeight + Sprite.idle[Sprite.tick][Y],        // Destination y
                        tileWidth,                  // Desintation width
                        tileHeight                  // Desintation height
                    );
                };
            })();

        if(img.complete) { drawImg(); }
        else { img.onload = drawImg; }
    }

    static increaseTick() {
        Sprite.tick = (Sprite.tick + 1) % Sprite.idle.length;
    }
}
Sprite.tick = 0;
Sprite.idle = [[-1,1], [0,0], [1,1]];


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
    constructor(context) {
        super();
        this._ctx = context;
    }

    generate(loc, typeOfUnit = UnitType.HERO, lvl = 1, isAutonomous = false, name = 'Hero') {
        let person = new Person(name, isAutonomous, 3, 2, 2, 20);
        person.setLocation(loc[X], loc[Y]);

        while(person.getLvl() < lvl) {
            person.gainExp(100);
        }

        if(typeOfUnit == UnitType.HERO) {
            let sprite = new Sprite('img/People/lyn_bladelord_sword.png', 40, 40, this._ctx);
            person.setSprite(sprite);
            person.rightHandEquipt(new Sword());
        }
        else {
            return null;
        }

        return person;
    }
}

class BadPersonFac extends I_PersonFac {
    constructor(context) {
        super();
        this._ctx = context;
    }

    generate(loc, typeOfUnit = UnitType.AXE, lvl = 1, isAutonomous = true, name = 'Bandit') {
        let person = new Person(name, isAutonomous, 2, 3);
        person.setLocation(loc[X], loc[Y]);

        while(person.getLvl() < lvl) {
            person.gainExp(100);
        }

        person.gainExp = (exp) => {};

        if(typeOfUnit == UnitType.AXE) {
            let sprite = new Sprite('img/People/bandit_axe.png', 50, 50, this._ctx);
            person.setSprite(sprite);
            person.leftHandEquipt(new Axe());
        }
        else {
            return null;
        }

        return person;
    }
}

class AbsFacPerson {
    static generate(context, affiliation = AffiliationEnum.NEUTRAL) {
        if(affiliation == AffiliationEnum.GOOD) {
            return new GoodPersonFac(context);
        }

        if(affiliation == AffiliationEnum.BAD) {
            return new BadPersonFac(context);
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
            && this.affiliation === undefined
            && this.hasRemainingActiveEntities === undefined
            && this.resetEntityStatus === undefined
        ) { throw new TypeError('Must override required methods'); }
    }
}

class PlayerState extends I_GameState {
    constructor(entities, affiliation = AffiliationEnum.GOOD) {
        super();
        this._affiliation = affiliation;
        this._entities = entities;
    }

    get affiliation() { return this._affiliation; }

    startAction(gameContext) {

        if(gameContext instanceof GameContext) {
            gameContext.state = this;
        }

        layer2.onclick = playerClickEvent;
    }

    hasRemainingActiveEntities() {

        if(!this._entities) return false;

        for(let entity of this._entities) {
            if(entity.getState() == EntityState.ACTIVE) return true;
        }

        return false;
    }

    resetEntityStatus() {

        for(let entity of this._entities) {
            entity.setState(EntityState.ACTIVE);
        }
    }
}

class NpcState extends I_GameState {
    constructor(entities, affiliation = AffiliationEnum.BAD) {
        super();
        this._affiliation = affiliation;
        this._entities = entities;
    }

    get affiliation() { return this._affiliation; }

    startAction(gameContext) {
        if(gameContext instanceof GameContext) {
            gameContext.state = this;
        }

        layer2.onclick = (evt) => {};

        if(!this._entities) return;

        for(let entity of this._entities) {

            if(!entity.getAutonomy()) continue;

            let entityMoves = getEntityMoves(entity.getLocation(), entity.getSpeed()),
                selectedMove = Math.floor(
                    Math.random() * (entityMoves.moves.length)
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

        if(!this._entities) return false;

        for(let entity of this._entities) {
            if(entity.getState() == EntityState.ACTIVE) return true;
        }

        return false;
    }

    resetEntityStatus() {

        for(let entity of this._entities) {
            entity.setState(EntityState.ACTIVE);
        }
    }
}

class GameContext {
    constructor() {
        this._state = null;
    }

    set state(state) {
        if(state instanceof I_GameState) {
            this._state = state;
        }
    }

    get state() {
        return this._state;
    }
}


// ************ Populate Page ************

let canvas,
    ctx,
    layer1,
    ctx1,
    layer2,
    ctx2,
    output,
    imgMap,
    selectedUnit,
    selectedUnitsMoves,
    selectedCoords,
    hoverCoords,
    numTilesX ,
    numTilesY,
    getCoords,
    VALID_PATH_MAP,
    goodEntityFac,
    badEntityFac,
    entities,
    gameContext,
    states,
    interval;

// ************ Functions ************

function init() {
    canvas = document.getElementById('main');
    ctx = canvas.getContext('2d');
    layer1 = document.getElementById('layer1');
    ctx1 = layer1.getContext('2d');
    layer2 = document.getElementById('layer2');
    ctx2 = layer2.getContext('2d');
    output = document.getElementById('entityInfo');
    imgMap = new Image();

    numTilesX = worldWidth / tileWidth;
    numTilesY = worldHeight / tileHeight;
    getCoords = (x, y) => {
    var xCoord = Math.floor(x / tileWidth),
        yCoord = Math.floor(y / tileHeight);

    return [xCoord, yCoord];
};
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
    ];
    goodEntityFac = AbsFacPerson.generate(ctx1, AffiliationEnum.GOOD);
    badEntityFac = AbsFacPerson.generate(ctx1, AffiliationEnum.BAD);
    entities = {
        enemies: [
            badEntityFac.generate([17,2], UnitType.AXE, 4, false, 'Bandit'),
            badEntityFac.generate([15,2]),
            badEntityFac.generate([18,4]),
            badEntityFac.generate([17,5]),
            badEntityFac.generate([12,6])
        ],
        allies: [
            goodEntityFac.generate([3,22])
        ]
    };

    gameContext = new GameContext();
    states = {
        0: new PlayerState(entities.allies),
        1: new NpcState(null, AffiliationEnum.NEUTRAL),
        2: new NpcState(entities.enemies)
    };


    render();

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

    interval = setInterval(() => {
        Sprite.increaseTick();
        render(CanvasLayers.ENTITIES);
    }, idleAnimationDuration);
}

function render(layer = CanvasLayers.ALL) {

    if(layer == CanvasLayers.ALL || layer == CanvasLayers.BACKGROUND) {
        imgMap.src = 'img/SimpleRPGmap2.png';

        let drawImg = (function() {
            return function() {
                ctx.drawImage(imgMap, 0, 0, worldWidth, worldHeight);
            }
        })();

        if(imgMap.complete) { drawImg(); }
        else { imgMap.onload = drawImg; }
    }

    if(layer == CanvasLayers.ALL || layer == CanvasLayers.ENTITIES) {
        ctx1.clearRect(0, 0, worldWidth, worldHeight);
        for(let prop in entities) {
            if (entities.hasOwnProperty(prop)) {
                for(let entity of entities[prop]) {
                    entity.getSprite().render(entity.getLocation());
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

    if(gameContext.state.hasRemainingActiveEntities()) { return; }

    gameContext.state.resetEntityStatus();

     do {
        states[
        (gameContext.state.affiliation + 1)
        % Object.keys(states).length
            ].startAction(gameContext);
    } while(gameContext.state instanceof NpcState);
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

    for(let pos of offsets) {
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

    imgMap.src = 'img/SimpleRPGmap.png';
    ctx.drawImage(imgMap, 0, 0, worldWidth, worldHeight);

    render(CanvasLayers.ENTITIES);

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
        for(let next of neighbors) {
            if(visited.has(next.toString())) continue;

            frontier.push(next);
            visited.add(next.toString());
        }
    }

    return {
        moves: moves,
        movesSet: boundary
    };
}

function findEntity(loc) {
    let entity = null;

    for(let i in entities) {
        if(entities.hasOwnProperty(i)) {
            entity = entities[i].find(
                (a) => isEqual(a.getLocation(), loc)
            );
        }

        if(entity) break;
    }

    return entity;
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
                NONWIN_EXP = 10;

            if(unit1.getHealth() <= 0) {
                let lvlDiff = unit1.getLvl() - unit2.getLvl(),
                    exp = BASE_EXP;
                    exp += (lvlDiff > 0)
                        ? BONUS_EXP * lvlDiff
                        : 0;

                unit2.gainExp(exp);
            }
            else { unit1.gainExp(NONWIN_EXP); }
        };

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
            //render(CanvasLayers.FOG);
            render();
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

                for(let tile of tilesNextToEntity) {
                    if(selectedUnitsMoves['movesSet'].has(tile.toString())) {
                        selectedUnit.setLocation(
                            tile[X],
                            tile[Y]);
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

$(document).ready(() => {
    init();
    start();
});


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