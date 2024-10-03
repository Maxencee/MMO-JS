import UI from "../classes/UI";
import { InventoryItem } from "./InventoryItem";

export class Inventory {
    static items = {
        nature:  ["BirchTree_1.gltf","DeadTree_3.gltf","Grass_Wispy_Short.gltf","Pine_2.gltf","BirchTree_2.gltf","Grass_Wispy_Tall.gltf","Pine_3.gltf","BirchTree_3.gltf","DeadTree_4.gltf","MapleTree_1.gltf","Pine_4.gltf","BirchTree_4.gltf","MapleTree_2.gltf","Pine_5.gltf","BirchTree_5.gltf","DeadTree_5.gltf","MapleTree_3.gltf","Plant_1.gltf","Bush.gltf","DeadTree_6.gltf","MapleTree_4.gltf","Plant_1_Big.gltf","Bush_Common.gltf","DeadTree_7.gltf","MapleTree_5.gltf","Plant_7.gltf","Bush_Common_Flowers.gltf","DeadTree_8.gltf","Mushroom_Common.gltf","Plant_7_Big.gltf","Bush_Flowers.gltf","DeadTree_9.gltf","Mushroom_Laetiporus.gltf","RockPath_Round_Small_1.gltf","Bush_Large.gltf","Fern_1.gltf","Pebble_Round_1.gltf","RockPath_Round_Small_2.gltf","Bush_Large_Flowers.gltf","Flower_1.gltf","Pebble_Round_2.gltf","RockPath_Round_Small_3.gltf","Bush_Small.gltf","Flower_1_Clump.gltf","Pebble_Round_3.gltf","RockPath_Round_Thin.gltf","Bush_Small_Flowers.gltf","Flower_2.gltf","Pebble_Round_4.gltf","RockPath_Round_Wide.gltf","Clover_1.gltf","Flower_2_Clump.gltf","Pebble_Round_5.gltf","RockPath_Square_Small_1.gltf","Clover_2.gltf","Flower_3_Clump.gltf","Pebble_Square_1.gltf","RockPath_Square_Small_2.gltf","CommonTree_1.gltf","Flower_3_Group.gltf","Pebble_Square_2.gltf","RockPath_Square_Small_3.gltf","CommonTree_2.gltf","Flower_3_Single.gltf","Pebble_Square_3.gltf","RockPath_Square_Thin.gltf","CommonTree_3.gltf","Flower_4_Clump.gltf","Pebble_Square_4.gltf","RockPath_Square_Wide.gltf","CommonTree_4.gltf","Flower_4_Group.gltf","Pebble_Square_5.gltf","Rock_Medium_1.gltf","CommonTree_5.gltf","Flower_4_Single.gltf","Pebble_Square_6.gltf","Rock_Medium_2.gltf","Flower_5_Clump.gltf","Petal_1.gltf","Rock_Medium_3.gltf","DeadTree_1.gltf","Grass_Common_Short.gltf","Petal_2.gltf","TwistedTree_1.gltf","DeadTree_10.gltf","Grass_Common_Tall.gltf","Petal_3.gltf","TwistedTree_2.gltf","Grass_Large.gltf","Petal_4.gltf","TwistedTree_3.gltf","DeadTree_2.gltf","Grass_Large_Extruded.gltf","Petal_5.gltf","TwistedTree_4.gltf","Grass_Small.gltf","Pine_1.gltf","TwistedTree_5.gltf"],
        kitchen: ["bowl.gltf","food_ingredient_potato.gltf","kitchentable_B_large.gltf","bowl_dirty.gltf","food_ingredient_potato_chopped.gltf","kitchentable_sink.gltf","bowl_small.gltf","food_ingredient_potato_mashed.gltf","kitchentable_sink_large.gltf","chair_A.gltf","food_ingredient_steak.gltf","kitchentable_sink_large_decorated.gltf","chair_B.gltf","food_ingredient_steak_pieces.gltf","knife.gltf","chair_stool.gltf","food_ingredient_tomato.gltf","lid_A.gltf","crate.gltf","food_ingredient_tomato_slice.gltf","lid_B.gltf","crate_buns.gltf","food_ingredient_tomato_slices.gltf","lid_large.gltf","crate_carrots.gltf","food_ingredient_vegetableburger_cooked.gltf","menu.gltf","crate_cheese.gltf","food_ingredient_vegetableburger_uncooked.gltf","mustard.gltf","crate_ham.gltf","food_stew.gltf","oven.gltf","crate_lettuce.gltf","food_vegetableburger.gltf","pan_006.gltf","crate_lid.gltf","fridge_A.gltf","pan_A.gltf","crate_onions.gltf","fridge_A_decorated.gltf","pan_B.gltf","crate_potatoes.gltf","fridge_B.gltf","papertowel.gltf","crate_steak.gltf","jar_A_large.gltf","pillar_A.gltf","crate_tomatoes.gltf","jar_A_medium.gltf","pillar_B.gltf","cuttingboard.gltf","jar_A_small.gltf","plate.gltf","dishrack.gltf","jar_B_large.gltf","plate_dirty.gltf","dishrack_plates.gltf","jar_B_medium.gltf","plate_small.gltf","door_A.gltf","jar_B_small.gltf","pot_A.gltf","door_B.gltf","jar_C_large.gltf","pot_A_stew.gltf","extractorhood.gltf","jar_C_medium.gltf","pot_B.gltf","floor_kitchen.gltf","jar_C_small.gltf","pot_B_stew.gltf","floor_kitchen_small.gltf","jar_D_large.gltf","pot_large.gltf","food_burger.gltf","jar_D_medium.gltf","shelf_papertowel.gltf","food_dinner.gltf","jar_D_small.gltf","shelf_papertowel_decorated.gltf","food_ingredient_bun.gltf","ketchup.gltf","stew_bowl.gltf","food_ingredient_bun_bottom.gltf","kitchencabinet.gltf","stew_pot.gltf","food_ingredient_bun_top.gltf","kitchencabinet_corner.gltf","stove_multi.gltf","food_ingredient_burger_cooked.gltf","kitchencabinet_corner_half.gltf","stove_multi_countertop.gltf","food_ingredient_burger_trash.gltf","kitchencabinet_half.gltf","stove_multi_decorated.gltf","food_ingredient_burger_uncooked.gltf","kitchencounter_innercorner.gltf","stove_single.gltf","food_ingredient_carrot.gltf","kitchencounter_innercorner_backsplash.gltf","stove_single_countertop.gltf","food_ingredient_carrot_chopped.gltf","kitchencounter_outercorner.gltf","table_round_A.gltf","food_ingredient_carrot_pieces.gltf","kitchencounter_outercorner_backsplash.gltf","table_round_A_decorated.gltf","food_ingredient_cheese.gltf","kitchencounter_sink.gltf","table_round_A_small.gltf","food_ingredient_cheese_chopped.gltf","kitchencounter_sink_backsplash.gltf","table_round_A_small_decorated.gltf","food_ingredient_cheese_slice.gltf","kitchencounter_straight_A.gltf","table_round_B.gltf","food_ingredient_ham.gltf","kitchencounter_straight_A_backsplash.gltf","towelrail.gltf","food_ingredient_ham_cooked.gltf","kitchencounter_straight_A_decorated.gltf","wall.gltf","food_ingredient_ham_trash.gltf","kitchencounter_straight_B.gltf","wall_decorated.gltf","food_ingredient_lettuce.gltf","kitchencounter_straight_B_backsplash.gltf","wall_doorway.gltf","food_ingredient_lettuce_chopped.gltf","kitchencounter_straight_decorated.gltf","wall_half.gltf","food_ingredient_lettuce_slice.gltf","kitchentable_A.gltf","wall_orderwindow.gltf","food_ingredient_onion.gltf","kitchentable_A_large.gltf","wall_orderwindow_decorated.gltf","food_ingredient_onion_chopped.gltf","kitchentable_A_large_decorated.gltf","wall_window_closed.gltf","food_ingredient_onion_rings.gltf","kitchentable_B.gltf","wall_window_open.gltf"],
        furniture: ["armchair.gltf","cactus_small_A.gltf","pictureframe_large_B.gltf","rug_rectangle_stripes_B.gltf","armchair_pillows.gltf","cactus_small_B.gltf","pictureframe_medium.gltf","shelf_A_big.gltf","bed_double_A.gltf","chair_A.gltf","pictureframe_small_A.gltf","shelf_A_small.gltf","bed_double_B.gltf","chair_A_wood.gltf","pictureframe_small_B.gltf","shelf_B_large.gltf","bed_single_A.gltf","chair_B.gltf","pictureframe_small_C.gltf","shelf_B_large_decorated.gltf","bed_single_B.gltf","chair_B_wood.gltf","pictureframe_standing_A.gltf","shelf_B_small.gltf","book_set.gltf","chair_C.gltf","pictureframe_standing_B.gltf","shelf_B_small_decorated.gltf","book_single.gltf","chair_stool.gltf","pillow_A.gltf","table_low.gltf","cabinet_medium.gltf","chair_stool_wood.gltf","pillow_B.gltf","table_medium.gltf","cabinet_medium_decorated.gltf","couch.gltf","rug_oval_A.gltf","table_medium_long.gltf","cabinet_small.gltf","couch_pillows.gltf","rug_oval_B.gltf","table_small.gltf","cabinet_small_decorated.gltf","lamp_standing.gltf","rug_rectangle_A.gltf","cactus_medium_A.gltf","lamp_table.gltf","rug_rectangle_B.gltf","cactus_medium_B.gltf","pictureframe_large_A.gltf","rug_rectangle_stripes_A.gltf"]
    };

    static create (callback) {
        return UI.element('div', {
            class: "hidden w-full h-dvh flex justify-center items-center fixed top-0 left-0 bg-black bg-opacity-70 z-50",
        }, [
            UI.element('div', {
                class: "h-4/6 min-w-[75%] p-4 rounded bg-neutral-800 flex flex-col gap-4",
            }, [
                UI.element('div', {
                    class: "flex justify-between items-center",
                }, [
                    UI.element('h1', {
                        class: "text-2xl text-neutral-100"
                    }, [ "Catalog" ]),
                    UI.element('button', {
                        class: "text-neutral-100",
                    }, [
                        "Close"
                    ], {
                        click: () => UI.get("inventoryContainer").classList.add("hidden")
                    })
                ]),
                UI.element('nav', {
                    class: "flex items-center gap-2"
                }, [
                    'nature',
                    'furniture',
                    'kitchen'
                ].map(collection => UI.element('button', {
                    class: "px-4 py-2 border-solid border-2 rounded border-neutral-200 text-neutral-200",
                    "data-collection": collection
                }, [ collection ], {
                    click: function () {
                        const container = document.querySelector('.inventory-display-grid');
                        container.innerHTML = null;

                        Inventory.items[this.dataset.collection].forEach(item => {
                            container.appendChild(InventoryItem.create(item, collection))
                        })
                    }
                }))),
                UI.element('div', {
                    class: "inventory-display p-4 h-full overflow-y-auto"
                }, [
                    UI.element('div', {
                        class: "inventory-display-grid grid rounded grid-cols-4 gap-x-2 gap-y-4"
                    }, [
                        "Catalog of items"
                    ])
                ])
            ])
        ]);
    }
}