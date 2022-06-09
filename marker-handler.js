var tableNum = null;
AFRAME.registerComponent("marker-handler", {
    init: async function(){
        var dishes = await this.getDishes();

        if (tableNum === null) {
            this.askTableNum();
        }

        this.el.addEventListener("markerFound", ()=>{
            //console.log("marker is fouddddnd");
            if (tableNum !== null){
                var markerId = this.el.id;
                this.handleMarkerFound(dishes, markerId);
            }
        });
        this.el.addEventListener("markerLost", ()=>{
            //console.log("marker is very lost");
            this.handleMarkerLost();
        });
    },
    handleMarkerFound: function(dishes, markerId){
        var todays_date = new Date();
        var todays_day = todays_date.getDay();
        var days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

        var dish = dishes.filter(dish=>dish.id === markerId)[0];

        if (dish.unavailable_days.includes(days[todays_day])){
            swal({
                icon:"warning",
                title:dish.dish_name.toUpperCase(),
                text: "FOOD NOT HERE",
                timer:2500,
                button: false
            });
        }else{
            var model = document.querySelector(`#model-${dish.id}`);
            model.setAttribute("visible", true);

            var ingredientsContainer = document.querySelector(`#plane-${dish.id}`);
            ingredientsContainer.setAttribute("visible", true);

            var price_plane = document.querySelector(`#price-plane-${dish.id}`);
            price_plane.setAttribute("visible", true);

            model.setAttribute("position", dish.model_geometry.position);
            model.setAttribute("position", dish.model_geometry.rotation);
            model.setAttribute("position", dish.model_geometry.scale);

            var buttonDiv = document.getElementById("button-div");
            buttonDiv.style.display = "flex";
            
            var ratingButton = document.getElementById("ratingButton");
            var orderButton = document.getElementById("orderButton");
            var summaryButton = document.getElementById("summaryButton");
            var payButton = document.getElementById("pay-button")

            ratingButton.addEventListener("click", ()=>{
                /*swal({
                    icon:"warning",
                    title:"RATE DISH",
                    text:"DO NOT RATE DISH"
                });*/
                this.handleRating(dish);
            });

            orderButton.addEventListener("click", ()=>{
                var tnum;
                // next line\
                tableNum<=9 ? (tnum=`T0${tableNum}`) : `T${tableNum}`;
                this.handleOrder(tnum, dish);

                swal({
                    icon:"https://wikiclipart.com/wp-content/uploads/2017/06/Truck-black-and-white-semi-truck-clipart-black-and-white-free.jpg",
                    title:"ORDER COMING",
                    text:"YOUR ORDER COMING"
                });
            });

            summaryButton.addEventListener("click", ()=>{
                this.handleSummary();
            });

            payButton.addEventListener("click", ()=>{
                this.handlePayment();
            })
        }
    },
    handleMarkerLost: function(){
        var buttonDiv = document.getElementById("button-div");
        buttonDiv.style.display = "none";
    },
    getDishes: async function(){
        return await firebase.firestore().collection("dishes").get().then((snap)=>{
            return snap.docs.map(doc=>doc.data());
        });
    },
    handleSummary: function(){
        var tnum;
       // next line\
       tableNum<=9 ? (tnum=`T0${tableNum}`) : `T${tableNum}`;
        
        var order_summary = this.getSummary(tnum);

        var modalDiv = document.getElementById("modal-div");
        modalDiv.style.display = "flex";
        
        var tableBodyTag = document.getElementById("bill-table-body");
        tableBodyTag.innerHTML = "";
        var current_orders = Object.keys(order_summary.current_orders);
        current_orders.map(i=>{
            var tr = document.createElement("tr");
            var item = document.createElement("td");
            var price = document.createElement("td");
            var quantity = document.createElement("td");
            var subtotal = document.createElement("td");
            item.innerHTML = order_summary.current_orders[i].item;
            price.innerHTML = "$" + order_summary.current_orders[i].price;
            price.setAttribute("class", "text-center");
            quantity.innerHTML = order_summary.current_orders[i].quantity;
            quantity.setAttribute("class", "text-center");
            subtotal.innerHTML = order_summary.current_orders[i].subtotal;
            subtotal.setAttribute("class", "text-right");

            tr.appendChild(item);
            tr.appendChild(price);
            tr.appendChild(quantity);
            tr.appendChild(subtotal);
            tableBodyTag.appendChild(tr);
        });

        var total_tr = document.createElement("tr");
        var td1 = document.createElement("td");
        td1.setAttribute("class", "no-line");
        var td2 = document.createElement("td");
        td2.setAttribute("class", "no-line");
        var td3 = document.createElement("td");
        td3.setAttribute("class", "no-line");
        var strongTag = document.createElement("strong");
        strongTag.innerHTML = "Total";
        td3.appendChild(strongTag);
        var td4 = document.createElement("td");
        td4.setAttribute("class", "no-line text-right");
        td4.innerHTML = "$" + order_summary.total_bill

        total_tr.appendChild(td1);
        total_tr.appendChild(td2);
        total_tr.appendChild(td3);
        total_tr.appendChild(td4);
        tableBodyTag.appendChild(total_tr);
    },
    getSummary: function(tnum){
        firebase.firestore().collection("tables").doc(tnum).get().then(doc=>{
            doc.data();
        });
    },
    handleOrder: function(tnum, dish){
        firebase.firestore().collection("tables").doc(tnum).get().then(doc=>{
            var details = doc.data();
            if (details["current_orders"][dish.id]){
                details["current_orders"][dish.id]["quantity"]+=1;
                ////calculating the subtotal
                var current_quantity = details["current_orders"][dish.id]["quantity"];
                details["current_orders"][dish.id]["subtotal"] = current_quantity * dish.price;
            }
            else {
                details["current_orders"][dish.id] = {
                    item: dish.dish_name,
                    price: dish.price,
                    quantity: 1,
                    subtotal: dish.price * 1,
                };
            };
        });
        details.total_bill += dish.price;

        firebase.firestore().collection("tables").doc(doc.id).update(details);
        //waterbase.waterstore().collection("chairs").doc(doc.id).update(details);

    },
    handlePayment: function(){
        document.getElementById("modal-div").style.display = "none";
        var tnum;
        tableNum<=9 ? (tnum=`T0${tableNum}`) : `T${tableNum}`;

        firebase.firestore().collection("tables").doc(tnum).update({
            current_orders:{},
            total_bill: 0
        }).then(()=>{
            swal({
                icon:"success",
                title:"thank 4 paying",
                text:"we dont hope u enjoy food",
                timer:2500
            })
        })
    },
    askTableNum: function(){
        var icon_url = "https://raw.githubusercontent.com/whitehatjr/menu-card-app/main/hunger.png";
        //mi0sdvh udfgvyihdifngbiobfdgtvfakdgvsdbibhgegv gih fghvodbvibdkvdibjoedfvblrfbpbfp0ji rvihvriod
        swal({
            icon:icon_url,
            title:"welcome to lots of hunger",
            content:{
                element: "input",
                attributes: {
                    placeholder: "type the table number you sit at",
                    type: "number",
                    min: 1,
                }
            },
            closeOnClickOutside: false,

        }).then(inputValue=>{
            tableNum = inputValue;
        });
    },
    handleRating:  function(dish){
        var tnum;
        tableNum<=9 ? (tnum=`T0${tableNum}`) : `T${tableNum}`;

        var order_summary =  this.getSummary(tnum);
        var current_order = Object.keys(order_summary.current_orders);

        if (current_order.length > 0 && current_order === dish.id){
            document.getElementById("rating-modal-div").style.display = "flex";

            document.getElementById("rating-input").value = "0";
            document.getElementById("feedback-input").value = "";

            var saveRatingButton = document.getElementById("save-rating-button");
            saveRatingButton.addEventListener("click",()=>{
                document.getElementById("rating-modal-div").style.display = "none";

                var rating = document.getElementById("rating-input").value;
                var feedback = document.getElementById("feedback-input").value;

                firebase.firestore().collection("dishes").doc(dish.id).update({
                    last_review: feedback,
                    last_rating: rating
                }).then(()=>{
                    swal({
                        icon:"success",
                        title:"no thanks for rating",
                        timer:2500,
                        button:false
                    });
                });
            });
        }else{
            swal({
                icon:"warning",
                title:"u no buy food",
                timer:2500,
                button:false
            })
        }
    }
})