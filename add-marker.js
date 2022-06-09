AFRAME.registerComponent("create-markers", {
    init: async function(){
        var main_scene = document.querySelector("#main_scene");

        var dishes = await this.getDishes();
        dishes.map(dish=>{
            var marker = document.createElement("a-marker");
            marker.setAttribute("id", dish.id);
            marker.setAttribute("type", "pattern");
            marker.setAttribute("url", dish.marker_pattern_url);
            //marker.setAttribute("cursor", {rayOrigin: "mouse"});
            marker.setAttribute("marker-handler", {});

            main_scene.appendChild(marker);

            var todays_date = new Date();
            var todays_day = todays_date.getDay();
            var days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

            if (!dish.unavailable_days.includes(days[todays_day])){
                var model = document.createElement("a-entity");
                model.setAttribute("id", `model-${dish.id}`);
                model.setAttribute("position", dish.model_geometry.position);
                model.setAttribute("rotation", dish.model_geometry.rotation);
                model.setAttribute("scale", dish.model_geometry.scale);
                model.setAttribute("gltf-model", `url(${dish.model_geometry.model_url})`);
                model.setAttribute("gesture-handler", {});

                marker.appendChild(model);

                var main_plane = document.createElement("a-plane");
                main_plane.setAttribute("id", `plane-${dish.id}`);
                main_plane.setAttribute("position", {x:0, y:0, z:0});
                main_plane.setAttribute("rotation", {x:-90, y:0, z:0});
                main_plane.setAttribute("width", 1.7);
                main_plane.setAttribute("height", 1.5);
                
                marker.appendChild(main_plane);

                var title_plane = document.createElement("a-plane");
                title_plane.setAttribute("id", `plane-title-${dish.id}`);
                title_plane.setAttribute("position", {x:0, y:0.89, z:0.02});
                title_plane.setAttribute("rotation", {x:0, y:0, z:0});
                title_plane.setAttribute("width", 1.69);
                title_plane.setAttribute("height", 0.3);

                main_plane.appendChild(title_plane);

                var dish_title = document.createElement("a-entity");
                title_plane.setAttribute("id", `title-${dish.id}`);
                title_plane.setAttribute("position", {x:0, y:0.89, z:0.2});
                title_plane.setAttribute("rotation", {x:0, y:0, z:0});
                title_plane.setAttribute("text", {
                    font: "monoid",
                    color: "black",
                    height: 1,
                    width: 1.8,
                    align: "center",
                    value: dish.dish_name.toUpperCase()
                });

                title_plane.appendChild(dish_title);

                var dish_text = document.createElement("a-entity");
                dish_text.setAttribute("id", `text-${dish.id}`);
                dish_text.setAttribute("position", {x:0.3, y:0, z:0.1});
                dish_text.setAttribute("rotation", {x:0, y:0, z:0});
                dish_text.setAttribute("text", {
                    font: "monoid",
                    color: "black",
                    width: 1.8,
                    align: "left",
                    value: `${dish.ingredients.join("\n \n")}`
                });

                main_plane.appendChild(dish_text);

                var price_plane = document.createElement("a-image");
                price_plane.setAttribute("id", `price-plane-${dish.id}`);
                price_plane.setAttribute("src", "https://raw.githubusercontent.com/whitehatjr/menu-card-app/main/black-circle.png");
                price_plane.setAttribute("width", 0.8);
                price_plane.setAttribute("height", 0.8);
                price_plane.setAttribute("position", {x:-1.3, y:0, z:0.3});
                price_plane.setAttribute("rotation", {x:-90, y:0, z:0});

                var price = document.createElement("a-entity");
                price.setAttribute("id", `price-${dish.id}`);
                price.setAttribute("position", {x:0.03, y:0, z:0.1});
                price.setAttribute("rotation", {x:0, y:0, z:0});
                price.setAttribute("text", {
                    font: "mozillavr",
                    color: "white",
                    width: 3,
                    align: "center",
                    value: `$${dish.price}.00`
                });
                
                price_plane.appendChild(price);
                marker.appendChild(price_plane);
            }
        });
    },
    getDishes: async function(){
        return await firebase.firestore().collection("dishes").get().then(snap=>{
            return snap.docs.map(doc=> doc.data());
        });
    }
});