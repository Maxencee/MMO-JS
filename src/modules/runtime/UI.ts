export default class UI {
    static three = {};
    static root;
    static renderers;

    static init () {
        UI.root = document.getElementById('root');
        UI.renderers = document.getElementById('renderers');
    }

    static add (element, name = null) {
      if(name) UI.three[name] = element;
      return UI.root.appendChild(element);
    }
  
    static get (name) {
      return UI.three[name] || null;
    }

    static remove (name) {
        UI.three[name]?.remove();
        delete UI.three[name];
    }
  
    static clear () {
      UI.root.innerHTML = null;
    }

    static style (file) {
        let style = document.createElement('link');
        style.rel = 'stylesheet';
        style.href = file;
        document.head.appendChild(style);
    }

    static element (tag, options = {}) {
        const element = document.createElement(tag);

        Object.entries(options.attributes).forEach(([name, value]) => {
            element.setAttribute(name, value);
            element[name] = value;
        });
        
        Object.entries(options.events).forEach(([name, callback]) => {
            if (name.endsWith("Once")) {
                element.addEventListener(name.substring(0, -4), callback.bind(element), { once: true });
            }
            else {
                element.addEventListener(name, callback.bind(element));
            }
        });

        options.children.forEach(child => {
            if(child.tagName) {
                element.appendChild(child);
            } else if (child.forEach) {
                child.forEach(c => element.appendChild(c));
            } else {
                element.appendChild(document.createTextNode(child));
            }
        });

        return element; 
    }
}