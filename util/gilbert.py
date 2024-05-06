import random
import uuid
from util.gilbert_util import *


def update_gilbert_statistics(gilbert_old, gilbert_enemies_dict):
    gilbert_new = gilbert_old.copy()

    current_stage = gilbert_old.get("stage")
    current_hunger = gilbert_old.get("hunger")
    current_happiness = gilbert_old.get("happiness")
    current_health = gilbert_old.get("health")
    seconds_alive = gilbert_old.get("seconds_alive")
    xp = gilbert_old.get("xp")
    xp_levelup = gilbert_old.get("xp_to_levelup")
    current_level = gilbert_old.get("level")

    # update stage of gilberts live
    # stage 0: only keep track of hunger
    # stage 1: hunger + happiness (more functionality for happiness, also make it harder)
    # stage 2: enemies start spawning, gold drops
    # stage 3: shop opens (has passive upgrades and also items to purchase (new friendly windows like plant or house))
    if seconds_alive <= 15:
        current_stage = 0
    elif seconds_alive <= 30:
        current_stage = 1
    elif seconds_alive <= 60:
        current_stage = 2

    if current_level >= 5:
        current_stage = 3

    

    # update return object
    gilbert_new["stage"] = current_stage


    # only keep track of hunger, slower hunger loss
    if current_stage == 0:
        # get new states of hunger
        new_health, new_hunger = stage_zero(current_hunger, current_health)

        # update new object
        gilbert_new["health"] = new_health
        gilbert_new["hunger"] = new_hunger


    # add happiness to the mix, faster hunger loss, but treats contribute to hunger as well
    elif current_stage == 1:
        # get new states of stats
        new_health, new_hunger, new_happiness = stage_one(current_hunger, current_health, current_happiness)

        # update new object
        gilbert_new["health"] = new_health
        gilbert_new["hunger"] = new_hunger
        gilbert_new["happiness"] = new_happiness



    # monster spawning, leveling, xp from kills, simple monsters
    elif current_stage == 2 or current_stage == 3:
        # get new states of stats
        new_health, new_hunger, new_happiness = stage_two(current_hunger, current_health, current_happiness)

        # update new object
        gilbert_new["health"] = new_health
        gilbert_new["hunger"] = new_hunger
        gilbert_new["happiness"] = new_happiness

    # gilbert xp logic
    if xp >= xp_levelup:
        gilbert_new["xp"] -= xp_levelup
        gilbert_new["level"] += 1

        level = gilbert_new["level"]

        if 0 <= level <= 4:
            gilbert_new["xp_to_levelup"] = 5

        elif 5 <= level <= 9:
            gilbert_new["xp_to_levelup"] = 10

        elif 10 <= level <= 14:
            gilbert_new["xp_to_levelup"] = 25

        elif 15 <= level <= 19:
            gilbert_new["xp_to_levelup"] = 50

        elif 20 <= level <= 29:
            gilbert_new["xp_to_levelup"] = 100

        elif 30 <= level <= 49:
            gilbert_new["xp_to_levelup"] = 250

        elif 50 <= level <= 74:
            gilbert_new["xp_to_levelup"] = 500

        else:
            gilbert_new["xp_to_levelup"] = 1000



    # gilbert status logic
    if gilbert_enemies_dict:
        gilbert_new["status"] = "under attack"
    elif current_hunger >= 50:
        gilbert_new["status"] = "happy"
    elif current_hunger >= 25:
        gilbert_new["status"] = "hungry"
    elif current_hunger >= 0:
        gilbert_new["status"] = "starving"
            

    # low health triggers death
    if current_health <= 0:
        gilbert_new["alive"] = False

    
    # change seconds alive, only update if alive
    if gilbert_old["alive"] == True:
        gilbert_new["seconds_alive"] = seconds_alive + 1

    if gilbert_new["health"] == 0:
        gilbert_new["status"] = "dead"

    return gilbert_new


def handle_gilbert_action(action, gilbert_old):

    gilbert_new = gilbert_old.copy()
    
    current_hunger = gilbert_old.get("hunger")
    current_happiness = gilbert_old.get("happiness")
    current_health = gilbert_old.get("health")

    
    if action == "feed":
        if current_hunger <= 100:
            gilbert_new["hunger"] = min(current_hunger + 5, 100)
        # happiness goes down if you overfeed him, also health too?
        elif current_hunger >= 100:
            gilbert_new["happiness"] = max(current_happiness - 5, 0)
            gilbert_new["health"] = max(current_health - 1, 0)


    if action == "pet" and gilbert_old.get("stage") >= 1:
        if current_happiness <= 100:
            gilbert_new["happiness"] = min(current_happiness + 5, 100)


    if action == "hurt":
        gilbert_new["health"] = max(current_health - 1, 0)


    return gilbert_new 


def handle_gilbert_levelup(current_level, current_xp):
    new_level = current_level
    new_xp = current_xp

    if current_xp == 10:
        new_level += 1
        new_xp = 0

    return new_level, new_xp
    

def set_initial_gilbert(debug = False):

    gilbert_upgrades = {
        # gilbert damage
        "damage": 0,
        "damage_cost": 75,
        # defense, take away a percent of damage from some attacks 
        "defense": 0,
        "defense_cost": 25,
        # gilbert max health
        "health": 0,
        "health_cost": 15,
        # passive regen
        "regen": 0,
        "regen_cost": 150,
        # higher chance to spawn loot bags
        "luck": 0,
        "luck_cost": 100,
        # healths gilbert a small amount x amount of times
        "HealthPot" : 0,
        "HealthPot_cost" : 10,
        # Gold farm implementation
        "GoldFarm" : 0,
        "GoldFarm_cost" : 25,
        "Food" : 0,
        "Food_cost": 50

    }

    gilbert_stats = {
        "alive": True,
        "health": 100,
        "hunger": 70,
        "happiness": 70,
        "level": 20 if debug else 1,
        "seconds_alive": 0,
        "status": "happy",
        "gold": 10000000 if debug else 0,
        "xp": 0,
        "xp_to_levelup": 5,
        "stage": 0,

        "damage": 1,
        "defense": 0,
        "max_health": 100,
        "regen": 0,
        "GoldFarm": 0,
        "Food": 0,
        "luck": 0,
        "enemies_defeated": 0,

        "inventory": {},
        "upgrades": gilbert_upgrades
    }

    return gilbert_stats

def generate_gilbert_thought(gilbert_thoughts_collection, userlist):

    # random message from chat
    if random.randint(0,1):
        pipeline = [{"$sample": {"size": 1}}]
        thought = list(gilbert_thoughts_collection.aggregate(pipeline))

        if thought:
            thought = thought[0]

            if thought.get("type") == "normal" or thought.get("type") == "from_user":
                return {'message': thought.get("message")}

    # random set message
    else:

        user = random.choice(userlist)

        if user:
            thought_list = [
                f"<b>@{user}</b> is so cool!!", 
                f"i wish <b>@{user}</b> would give me food...", 
                f"no way... <b>@{user}</b> is yapping...",  
                f"<b>@{user}</b> is a yapper fs",
                f"hi <b>@{user}</b>",
                f"<b>@{user}</b>... i'm so hungry........",
                 f"<b>@{user}</b> <b>@{user}</b> <b>@{user}</b>",
                f"i agree with <b>@{user}</b>",
                f"hello <b>@{user}</b>",
                f"i would have to agree <b>@{user}</b>",
                f"<b>@all</b> guys give me food",
            ]

            thought = random.choice(thought_list)
            return {'message': thought}
        