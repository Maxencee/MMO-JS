export default class UI {
    static three = {};
    static root;

    static init () {
        UI.root = document.getElementById('root');
    }

    static add (element, name = null) {
      if(name) UI.three[name] = element;
      return UI.root.appendChild(element);
    }
  
    static get (name) {
      return UI.three[name] || null;
    }

    static remove (name) {
        return UI.three[name]?.remove()
    }
  
    static clear () {
      UI.root.innerHTML = null;
    }

    static element (tag, attributes, children, events = {}) {
        const element = document.createElement(tag);

        Object.entries(attributes).forEach(([name, value]) => {
            element.setAttribute(name, value);
            element[name] = value;
        });
        
        Object.entries(events).forEach(([name, callback]) => {
            if (name.endsWith("Once")) {
                element.addEventListener(name.substring(0, -4), callback.bind(element), { once: true });
            }
            else {
                element.addEventListener(name, callback.bind(element));
            }
        });

        children.forEach(child => {
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