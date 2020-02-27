

let _selected_element = null;


// Drop down list something
function _dddl(el) {
    const target_element = el.parentElement.getElementsByTagName('div')[0];
    _selected_element = target_element;
    target_element.classList.toggle("show");
}



// Remove dropdown menu
window.addEventListener('click', evt => {

    // TODO navigate up to dropdown

    if (evt.target.matches('.dropbtn')) return;

    const dropdowns = document.getElementsByClassName("dropdown-content");
    for (let i = 0; i < dropdowns.length; i += 1) {
        const openDropdown = dropdowns[i];
        if (openDropdown.classList.contains('show')) {
            openDropdown.classList.remove('show');
        }
    }
});


function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}


const window_manager = (() => {

    const _window_objects = [];

    function addElement(el) {

        for (let i = 0; i < _window_objects.length; i += 1) {
            if (_window_objects[i] == el) return;
        }

        _window_objects.push(el);

        dragElement(el);
    }

    function dragElement(elmnt) {
  
      let pos1 = 20;
      let pos2 = 20;
      let pos3 = 20;
      let pos4 = 20;
  
      const div_window = elmnt;
      let div_window_head = null;
      let div_window_body = null;
  
      for (let i = 0; i < div_window.children.length; i += 1) {
          const child = div_window.children[i];
  
          if (child.classList.contains('div-window-head')) {
              div_window_head = child;
          }
  
          if (child.classList.contains('div-window-body')) {
              div_window_body = child;
          }
      }
  
  
      if (div_window_head) {
          div_window_head.onmousedown = dragMouseDown;
      } else {
          div_window.onmousedown = dragMouseDown;
      }
  
      function downWithOthers() {
          for (let i = 0; i < _window_objects.length; i += 1) {
              const wo = _window_objects[i];
              // Intentional ==
              if (wo == elmnt) {
                  wo.style.zIndex = 10;
              } else {
                  wo.style.zIndex = 9;
              }
          }        
      }
  
      function dragMouseDown(e) {
        e.preventDefault();
        downWithOthers();
        e = e || window.event;
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
      }
      
      function elementDrag(e) {
        e.preventDefault();
        e = e || window.event;
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
      }
      
      function closeDragElement() {
        /* stop moving when mouse button is released:*/
        document.onmouseup = null;
        document.onmousemove = null;
      }
  }

  return {
    addElement
  };

})();






const _temp = document.getElementsByClassName('div-window');
for (let i = 0; i < _temp.length; i += 1) {
    window_manager.addElement(_temp[i]);
}



//Make the DIV element draggagle:

