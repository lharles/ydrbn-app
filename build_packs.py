import os
import json

# Base directory for the App Store
BASE_DIR = "public/content"

# 1. The Master Registry
MASTER_INDEX = {
  "availablePacks": [
    {"id": "ydrbn-words-goobledygoop", "name": "Goobledygoop Language", "description": "Bent language and absurd utterances.", "manifestUrl": "goobledygoop/manifest.json"},
    {"id": "ydrbn-words-toddler", "name": "Toddler Logic", "description": "Sticky hands and strange vocabularies.", "manifestUrl": "toddler/manifest.json"},
    {"id": "ydrbn-words-scatological", "name": "Scatological", "description": "Grossly matter-of-fact terminology.", "manifestUrl": "scatological/manifest.json"},
    {"id": "ydrbn-words-antisocial", "name": "Antisocial Hostility", "description": "Hostile, uncooperative little words.", "manifestUrl": "antisocial/manifest.json"},
    {"id": "ydrbn-words-unhinged", "name": "Unhinged", "description": "Completely off-the-rails terminology.", "manifestUrl": "unhinged/manifest.json"},
    {"id": "ydrbn-bg-cleandirty", "name": "Clean/Dirty Backgrounds", "description": "Contrasting split-surface textures.", "manifestUrl": "cleandirty/manifest.json"},
    {"id": "ydrbn-bg-furry", "name": "Furry Textures", "description": "Coarse hair and pastel pelts.", "manifestUrl": "furry/manifest.json"},
    {"id": "ydrbn-bg-impossible", "name": "Impossible Places", "description": "Surreal architectural intersections.", "manifestUrl": "impossibleplaces/manifest.json"},
    {"id": "ydrbn-bg-nonsensical", "name": "Nonsensical", "description": "Abstract figures in strange landscapes.", "manifestUrl": "nonsensical/manifest.json"},
    {"id": "ydrbn-bg-pristine", "name": "Pristine Disaster", "description": "ASCII art and flooded coastal meadows.", "manifestUrl": "pristinedisaster/manifest.json"}
  ]
}

# 2. The Word Packs Data
WORD_PACKS = {
    "goobledygoop": {
        "manifest": { "id": "ydrbn-words-goobledygoop", "name": "Goobledygoop Language", "version": "1.0.0", "words": "words.json", "stamps": [] },
        "words": {
            "nouns": ["Blorp", "Flump", "Wibble", "Drangle", "Sploof", "Gronk", "Plim", "Zibble", "Squonk", "Glorp", "Flim", "Snork", "Plap", "Frump", "Nood", "Squigglewort", "Bork", "Janglefoot", "Whiffle", "Plonk", "Snorf", "Crumpetizer", "Yow", "Flibbertigibbet", "Gloober"],
            "adjectives": ["Blorpy", "Flumpish", "Wibbly", "Drangly", "Sploofy", "Gronky", "Plimpy", "Wobulous", "Frabjous", "Squonky", "Glorped", "Flimsy", "Zibbly", "Snorkish", "Plapular", "Frumptious", "Noodaceous", "Squiggulous", "Borked", "Janglefooted", "Whiffly", "Plonkulent", "Snorfy", "Crumptious", "Yowly"],
            "ensembles": ["Frabble", "Splunge", "Wazzle", "Plapper", "Dribblet", "Snorkle", "Blimble", "Quoodle", "Zazzle", "Flobbers", "Gibberment", "Oddlot", "Squabble", "Whifflepack", "Plonkers", "Snortle", "Bafflegroup", "Doodadery", "Flummery", "Gobblerama", "Wobblelot", "Flapdoodle", "Yapcluster", "Thingamabunch", "Gloobers"]
        }
    },
    "toddler": {
        "manifest": { "id": "ydrbn-words-toddler", "name": "Toddler Logic", "version": "1.0.0", "words": "words.json", "stamps": [] },
        "words": {
            "nouns": ["Binky", "Blankie", "Tummy", "Toesies", "Snacky", "Stuffie", "Lovey", "Boo-Boo", "Wawa", "Nugget", "Tickle", "Oopsie", "Baba", "Bubby", "Sippy", "Blanklet", "Tummybutton", "Crayonbox", "Nosey", "Naptime", "Peekaboo", "Gigglebug", "Cuddlebug", "Toddle", "Splashy"],
            "adjectives": ["Wiggly", "Bouncy", "Cranky", "Sticky", "Yucky", "Gooey", "Squishy", "Bitey", "Pokey", "Owie", "Soggy", "Fussy", "Drooly", "Sneezy", "Pouty", "Boingy", "Tooty", "Nappy", "Snuggly", "Oopsy", "Babbly", "Hiccuppy", "Munchy", "Grabby", "Cuddly"],
            "ensembles": ["Giggle", "Wobble", "Wiggle", "Snuggle", "Cuddle", "Playgroup", "Snackpack", "Nursery", "Babble", "Gigglefit", "Wigglet", "Bouncers", "Munchkins", "Tinyfolk", "Rugrats", "Anklebiters", "Stickyhands", "Crayonclub", "Napcrew", "Blanketfort", "Babygang", "Sandboxers", "Fingerpainters", "Cuddlecrew", "Toddlepack"]
        }
    },
    "scatological": {
        "manifest": { "id": "ydrbn-words-scatological", "name": "Scatological", "version": "1.0.0", "words": "words.json", "stamps": [] },
        "words": {
            "nouns": ["Doody", "Dung", "Crap", "Rear", "Rectum", "Colon", "Anus", "Sphincter", "Taint", "Crack", "Flatulence", "Wastecake", "Dropping", "Afterness", "Smear", "Stain", "Splatter", "Muck", "Sewer", "Evacuation", "Bowel", "Turdlet", "Dumpster", "Deposit", "Effluent"],
            "adjectives": ["Turdish", "Poopy", "Doodyish", "Gassy", "Splattery", "Smeary", "Drippy", "Leaky", "Reeking", "Unflushed", "Unwiped", "Constipated", "Digestive", "Intestinal", "Colonic", "Anal", "Odorous", "Sewerish", "Muddy", "Brownish", "Sludgy", "Evacuative", "Rectalized", "Feculent", "Dungy"],
            "ensembles": ["Fartcloud", "Stinkpile", "Stinkwave", "Gasbag", "Dungheap", "Turdstack", "Crapcluster", "Poopparade", "Sewerbrigade", "Toilettrain", "Sludgepack", "Muckmob", "Splattercrew", "Brownout", "Bowelband", "Gutgaggle", "Excrementensemble", "Residueunit", "Depositdetail", "Odorcorps", "Stinksection", "Fecalformation", "Sewerposse", "Doodydelegation", "Turdtribunal"]
        }
    },
    "antisocial": {
        "manifest": { "id": "ydrbn-words-antisocial", "name": "Antisocial Hostility", "version": "1.0.0", "words": "words.json", "stamps": [] },
        "words": {
            "nouns": ["Grudge", "Grumpishness", "Recluse", "Hermit", "Loner", "Outsider", "Heckler", "Irritant", "Pest", "Menace", "Objection", "Refusal", "Refusalism", "Snub", "Insult", "Quarrel", "Tiff", "Feud", "Spite", "Venom", "Resentment", "Grumble", "Gatekeeper", "Interloper", "Curmudgeon"],
            "adjectives": ["Aloof", "Surly", "Snippy", "Petty", "Rude", "Hostile", "Spiteful", "Sulky", "Crabby", "Cantankerous", "Unhelpful", "Uncooperative", "Contrary", "Obstinate", "Belligerent", "Inhospitable", "Withdrawn", "Avoidant", "Solitary", "Uninvited", "Unwelcome", "Unneighborly", "Antagonistic", "Combative", "Testy"],
            "ensembles": ["Grudgecommittee", "Oppositionbloc", "Sourclique", "Cabal", "Blockade", "Barricade", "Standoff", "Feudclub", "Snubcircle", "Spitecaucus", "Grumbleguild", "Hecklerunion", "Lonerleague", "Recluseassembly", "Curmudgeonconclave", "Pestpatrol", "Nuisancebrigade", "Objectionpanel", "Refusalboard", "Quarrelquartet", "Antagonismalliance", "Hostilitycouncil", "Sourpusssection", "Snitgang", "Sourcaucus"]
        }
    },
    "unhinged": {
        "manifest": { "id": "ydrbn-words-unhinged", "name": "Unhinged", "version": "1.0.0", "words": "words.json", "stamps": [] },
        "words": {
            "nouns": ["Rampage", "Meltdown", "Frenzy", "Tantrum", "Breakdown", "Episode", "Escalation", "Outburst", "Detour", "Mishap", "Howler", "Misadventure", "Cataclysm", "Bonfire", "Stampede", "Riot", "Brouhaha", "Hullabaloo", "Trainwreck", "Debacle", "Shambles", "Freakout", "Ordeal", "Rampagecart", "Panicbutton"],
            "adjectives": ["Unhinged", "Deranged", "Bonkers", "Manic", "Rabid", "Frenzied", "Erratic", "Feral", "Chaotical", "Reckless", "Wobblebrained", "Delusional", "Unsanctioned", "Unsupervised", "Improvised", "Unauthorized", "Inexplicable", "Unnecessary", "Overcaffeinated", "Overcommitted", "Boilheaded", "Underqualified", "Misguided", "Too-Much", "Inappropriate"],
            "ensembles": ["Rampageunit", "Stampedecrew", "Riotbrigade", "Frenzyfleet", "Meltdowncommittee", "Tantrumcorps", "Bonfirebattalion", "Brouhahabrigade", "Hullabaloohorde", "Fiascoclub", "Debacledelegation", "Shamblessection", "Mayhemmission", "Panicposse", "Chaoscadre", "Frenzyformation", "Rampageassembly", "Disasterdetail", "Mishapmob", "Blunderband", "Misadventureleague", "Catastrophecouncil", "Outburstoutfit", "Escalationentourage", "Unhingedunion"]
        }
    }
}

# 3. The Image Packs Data
IMAGE_PACKS = {
    "cleandirty": {
        "manifest": {
            "id": "ydrbn-bg-cleandirty", "name": "Clean/Dirty Backgrounds", "version": "1.0.0",
            "stamps": ["CLEANDIRTY-Alien_metallic_surface_split.jpg", "CLEANDIRTY-Blue_fibers_and_black_residue.jpg", "CLEANDIRTY-Concrete_floor_split_horizontally.jpg", "CLEANDIRTY-Copper_sheet_with_crack.jpg", "CLEANDIRTY-Fog_rolling_across_stone_surface.jpg", "CLEANDIRTY-Frosted_glass_pane_with_smoke.jpg", "CLEANDIRTY-Glowing_fissure_dividing_alien_l….jpg", "CLEANDIRTY-Obsidian_floor_split_by_chalk.jpg", "CLEANDIRTY-River_dividing_planetary_surface.jpg", "CLEANDIRTY-Sanded_and_rotting_wood_plank.jpg", "CLEANDIRTY-Split_marble_surface_with_grime.jpg", "CLEANDIRTY-Stainless_steel_sheet_with_tape.jpg"]
        }
    },
    "furry": {
        "manifest": {
            "id": "ydrbn-bg-furry", "name": "Furry Textures", "version": "1.0.0",
            "stamps": ["FURRY-Abstract_orange_fur_pastel_drawing.jpg", "FURRY-Auburn_fur_abstract_texture_pain….jpg", "FURRY-Close-up_of_animal_fur_texture.jpg", "FURRY-Close-up_of_curly_wool_texture.jpg", "FURRY-Coarse_hair_texture_close_up.jpg", "FURRY-Drawing_of_green_and_gold.jpg", "FURRY-Oil_pastel_drawing_of_woolly.jpg", "FURRY-Painting_of_coarse_chestnut_bris.jpg", "FURRY-Painting_of_wispy_mane_hair.jpg", "FURRY-Silver_and_charcoal_hair_texture.jpg", "FURRY-Vibrant_multi-colored_synthetic_fur.jpg", "FURRY-Watercolor_painting_of_animal_fur.jpg", "FURRY-Watercolor_painting_of_hair_texture.jpg", "FURRY-Watercolor_painting_of_neon_fur.jpg", "FURRY-Watercolor_painting_of_white_pelt.jpg", "FURRY-White_pelt_texture_close-up.jpg"]
        }
    },
    "impossibleplaces": {
        "manifest": {
            "id": "ydrbn-bg-impossible", "name": "Impossible Places", "version": "1.0.0",
            "stamps": ["IMPOSSIBLEPLACES-Ballroom_with_inverted_forest_an.jpeg", "IMPOSSIBLEPLACES-Cathedral_windows_showing_coral.jpeg", "IMPOSSIBLEPLACES-Crystalline_trees_growing_in_desert.jpeg", "IMPOSSIBLEPLACES-Crystal_trees_in_desert.jpeg", "IMPOSSIBLEPLACES-Decaying_restaurant_near_black_hole.jpeg", "IMPOSSIBLEPLACES-Desert_highway_with_silk_ribbons.jpeg", "IMPOSSIBLEPLACES-Glass_trees_erupting_in_desert.jpeg", "IMPOSSIBLEPLACES-Greenhouse_with_glowing_neon_flora.jpeg", "IMPOSSIBLEPLACES-Ice_bookshelves_in_ancient_library.jpeg", "IMPOSSIBLEPLACES-IMPOSSIBLEPLACES-Ancient_library_with_black_water.jpeg", "IMPOSSIBLEPLACES-Library_with_water_and_ice.jpeg", "IMPOSSIBLEPLACES-Molten_lava_fills_backyard_pool.jpeg", "IMPOSSIBLEPLACES-Restaurant_at_black_hole_edge.jpeg", "IMPOSSIBLEPLACES-Restaurant_near_black_hole.jpeg", "IMPOSSIBLEPLACES-Waterfalls_in_bedroom_with_lily.jpeg", "IMPOSSIBLEPLACES-Water_running_into_hot_dog.jpeg"]
        }
    },
    "nonsensical": {
        "manifest": {
            "id": "ydrbn-bg-nonsensical", "name": "Nonsensical", "version": "1.0.0",
            "stamps": ["NONSENSICAL_Architecture_of_smoke_and_light.jpg", "NONSENSICAL_Distant_figure_in_surreal_landscape.jpg", "NONSENSICAL_Figure_hidden_in_crystalline_forest.jpg", "NONSENSICAL_Figure_near_stone_monolith.jpg", "NONSENSICAL_Figure_on_clay_plain.jpg", "NONSENSICAL_Figure_sitting_on_floating_boulders.jpg", "NONSENSICAL_Figure_watching_translucent_bubbles.jpg", "NONSENSICAL_Shadow_cast_in_amber_cave.jpg", "NONSENSICAL_Silhouetted_being_standing_near.jpg", "NONSENSICAL_Soap_bubble_island_above_desert.jpg", "NONSENSICAL_Surreal_landscape_drawn_with_crayon.jpg"]
        }
    },
    "pristinedisaster": {
        "manifest": {
            "id": "ydrbn-bg-pristine", "name": "Pristine Disaster", "version": "1.0.0",
            "stamps": ["PRISTINEDISASTER-Alpine_meadow_with_turquoise_lakes.jpg", "PRISTINEDISASTER-ASCII_flooded_coastal_landscape.jpg", "PRISTINEDISASTER-ASCII_rainforest_and_ash_desert.jpg", "PRISTINEDISASTER-Charcoal_drawing_of_alpine_meadow.jpg", "PRISTINEDISASTER-Charcoal_drawing_of_contrasting.jpg", "PRISTINEDISASTER-Flooded_coastal_city_reclaimed_b.jpg", "PRISTINEDISASTER-Flooded_coastal_landscape_under.jpg", "PRISTINEDISASTER-PRISTINEDISASTER-Alpine_meadow_ASCII_text_art.jpg", "PRISTINEDISASTER-Volcanic_wasteland_ASCII_art.jpg", "PRISTINEDISASTER-Volcanic_wasteland_showing_envir.jpg", "PRISTINEDISASTER-Volcanic_wasteland_with_flowing.jpg"]
        }
    }
}

def write_json(path, data):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)

print("🚀 Engaging Warp Drive... Building App Store Folders!")

# Ensure base directory exists
os.makedirs(BASE_DIR, exist_ok=True)

# Write Master Index
write_json(os.path.join(BASE_DIR, "index.json"), MASTER_INDEX)

# Build Word Packs
for folder, data in WORD_PACKS.items():
    pack_dir = os.path.join(BASE_DIR, folder)
    os.makedirs(pack_dir, exist_ok=True)
    write_json(os.path.join(pack_dir, "manifest.json"), data["manifest"])
    write_json(os.path.join(pack_dir, "words.json"), data["words"])
    print(f"✅ Created Word Pack: {folder}")

# Build Image Packs
for folder, data in IMAGE_PACKS.items():
    pack_dir = os.path.join(BASE_DIR, folder)
    stamps_dir = os.path.join(pack_dir, "stamps")
    os.makedirs(stamps_dir, exist_ok=True)
    write_json(os.path.join(pack_dir, "manifest.json"), data["manifest"])
    print(f"✅ Created Image Pack: {folder} (Drop images into {stamps_dir})")

print("🎉 Great Scott! The Holodeck is fully loaded.")