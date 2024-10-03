import UI from "../classes/UI";
import DesignScene from "../scenes/DesignScene";

export const MapButtons = UI.element('div', {
    class: "flex items-center justify-center w-full gap-4 my-5"
}, [
    UI.element('button', {
        class: "py-2 px-4 bg-green-500 text-white"
    }, ["Save"], {
        click: async () => {
            await fetch('http://localhost/MMO-JS-mapsave/index.php', {
                method: "POST",
                body: JSON.stringify(DesignScene.mapdata)
            })
        }
    }),
    UI.element('button', {
        class: "py-2 px-4 bg-blue-500 text-white"
    }, ["Load"], {
        click: async () => {
            await fetch('http://localhost/MMO-JS-mapsave/index.php').then(res => res.json()).then(data => {
                DesignScene.loadMap(data);
            });
        }
    })
])