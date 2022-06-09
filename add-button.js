AFRAME.registerComponent("create-button", {
    init: function(){
        var ratingButton = document.createElement("button");
        ratingButton.innerHTML = "DON'T RATE US";
        ratingButton.setAttribute("id", "ratingButton");
        ratingButton.setAttribute("class", "btn");

        var orderButton = document.createElement("button");
        orderButton.innerHTML = "ORDER LATER";
        orderButton.setAttribute("id", "orderButton");
        orderButton.setAttribute("class", "btn");

        var summaryButton = document.createElement("button");
        summaryButton.innerHTML = "ORDER SUMMARY";
        summaryButton.setAttribute("id", "summaryButton");
        summaryButton.setAttribute("class", "btn");

        var buttonDiv = document.getElementById("button-div");
        buttonDiv.appendChild(summaryButton);
        buttonDiv.appendChild(ratingButton);
        buttonDiv.appendChild(orderButton);
    }
});