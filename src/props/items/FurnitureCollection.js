import * as THREE from "three";
import PropStatic from "../../entities/PropStatic";

export class FurnitureCollection {
    static items = ["armchair.gltf","cactus_small_A.gltf","pictureframe_large_B.gltf","rug_rectangle_stripes_B.gltf","armchair_pillows.gltf","cactus_small_B.gltf","pictureframe_medium.gltf","shelf_A_big.gltf","bed_double_A.gltf","chair_A.gltf","pictureframe_small_A.gltf","shelf_A_small.gltf","bed_double_B.gltf","chair_A_wood.gltf","pictureframe_small_B.gltf","shelf_B_large.gltf","bed_single_A.gltf","chair_B.gltf","pictureframe_small_C.gltf","shelf_B_large_decorated.gltf","bed_single_B.gltf","chair_B_wood.gltf","pictureframe_standing_A.gltf","shelf_B_small.gltf","book_set.gltf","chair_C.gltf","pictureframe_standing_B.gltf","shelf_B_small_decorated.gltf","book_single.gltf","chair_stool.gltf","pillow_A.gltf","table_low.gltf","cabinet_medium.gltf","chair_stool_wood.gltf","pillow_B.gltf","table_medium.gltf","cabinet_medium_decorated.gltf","couch.gltf","rug_oval_A.gltf","table_medium_long.gltf","cabinet_small.gltf","couch_pillows.gltf","rug_oval_B.gltf","table_small.gltf","cabinet_small_decorated.gltf","lamp_standing.gltf","rug_rectangle_A.gltf","cactus_medium_A.gltf","lamp_table.gltf","rug_rectangle_B.gltf","cactus_medium_B.gltf","pictureframe_large_A.gltf","rug_rectangle_stripes_A.gltf"];

    static createItem (name, options) {
        return new PropStatic('/assets/models/furniture/' + name, options)
    }
}