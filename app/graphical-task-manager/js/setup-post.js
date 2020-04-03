    // Warning before leaving the page (back button, or outgoinglink)
    window.onbeforeunload = function () {
        return "Do you really want to leave?";
        //if we return nothing here (just calling return;) then there will be no pop-up question at all
        //return;
      };