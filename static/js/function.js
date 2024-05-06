const ws = true;
let socket = null

const audioDict = {
    "minimize": new Audio("/static/sounds/Windows 98 minimize.wav"),
    "chimes": new Audio("/static/sounds/CHIMES.WAV"),
    "chord": new Audio("/static/sounds/CHORD.WAV"),
    "dead": new Audio("/static/sounds/dead.mp3"),
    "ding": new Audio("/static/sounds/DING.WAV"),
    "tada": new Audio("/static/sounds/TADA.WAV"),
    "microsoft_sound": new Audio("/static/sounds/The Microsoft Sound.wav"),
    "startup": new Audio("/static/sounds/Windows 98 startup.wav"),
    "upgrade": new Audio("/static/sounds/upgrade.wav"),
    "enemy": new Audio("/static/sounds/enemy.wav"),
    "attack_sword": new Audio("/static/sounds/attack_sword.wav"),
    "good": new Audio("/static/sounds/good_job.wav"),
    "hit": new Audio("/static/sounds/hit.wav"),
    "portal": new Audio("/static/sounds/portal.wav"),
    "spider": new Audio("/static/sounds/spider_death.wav"),
    "pickup": new Audio("/static/sounds/pickup.wav"),
    "click": new Audio("/static/sounds/click.wav"),
}


function initWS() {
    // Establish a WebSocket connection with the server
    socket = io();
    console.log("socket: ", socket)
    audioDict.microsoft_sound.play()
}

function updateGilbertEnemiesDict() {
    const request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            clearEnemiesMain();


            const enemies = JSON.parse(this.response);
            // console.log("entire enemy list: ", enemies)

            if (enemies) {
                
                for (const [id, monster] of Object.entries(enemies)) {
                    // console.log(monster)
                    setTimeout(() => {
                        
                        if (monster.alive) {
                            createEnemy(monster);
                        } else {
                            createLoot(monster)
                        }
                
                        }, Math.floor(Math.random() * 3) * getRandomDelay());
                }
            }

        }
    };
    request.open("GET", "/send_gilbert_enemies");
    request.send();
}


function updatePost() {
    const request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            clearPostMain();

            let button = document.getElementById('pet_button');
            button.disabled = false;

            const posts = JSON.parse(this.response);
            posts.forEach((post, index) => {
                // Delay the display of each post


                setTimeout(() => {
                    if (post.hidden == false) {
                        displayPost(post);
                    }



                    if (post.messageType == "shame") {

                        const existingUser = document.getElementById("list_id_" + post.author);
                        if (!existingUser) {
                            document.getElementById('user-list').innerHTML += `<li id="list_id_${post.author}">${post.author}</li>`;


                            const containerElement = document.getElementById('user-div');
                            if (containerElement) {
                                containerElement.classList.add('like-anim');
                                containerElement.addEventListener('animationend', function () {
                                    containerElement.classList.remove('like-anim');
                                });
                            }
                        }


                    }



                    // console.log(post.content)
                }, index * getRandomDelay());
            });
        }
    };
    request.open("GET", "/send_posts"); //change path to whatever we are using
    request.send();
}

// Function to get a random delay value
function getRandomDelay() {
    return Math.floor(Math.random() * 70); // Random delay between 0 and 3 seconds
}


function likePost(messageId) {

    if (ws) {
        socket.emit('like_post', messageId);
    } else {
        const request = new XMLHttpRequest();

        request.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                updatePost();
            }
        }
        request.open("POST", "/handle_like/" + messageId);
        request.send();
    }
}

function clearPostMain() {
    const postMain = document.getElementById("post-list");
    postMain.innerHTML = "";
}

function clearEnemiesMain() {
    const postMain = document.getElementById("enemy-list");
    postMain.innerHTML = "";
}


function sendPost() {

    const postTextBox = document.querySelector(".create-text");
    const message = postTextBox.value; //value of the post or message
    if (message == "") {
        return
    }

    let button = document.getElementById('post_button');
    button.disabled = true;
    button.classList.add('buttonClick');

    let textarea = document.getElementById("text_area_post");
    textarea.disabled = true

    setTimeout(function () {
        button.disabled = false;
        button.classList.remove('buttonClick')
        textarea.disabled = false;

    }, 2500);

    // console.log(message)
    postTextBox.value = "";
    // Using AJAX
    if (ws) {
        socket.emit('create_post_ws', message);
        // console.log("hello")
    } else {
        const request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                console.log(this.response);
            }
        }
        const messageJSON = { "content": message };
        request.open("POST", "/create_post");
        request.setRequestHeader("Content-Type", "application/json");
        request.send(JSON.stringify(messageJSON));
        postTextBox.focus();
    }


    // updatePost();
}

function welcome() {
    document.getElementById("js-test").innerHTML += " This text was added by JavaScript 😀";
}

function initializePostPage() {
    updatePost()
    updateGilbertEnemiesDict()
    audioDict.microsoft_sound.play()
    document.addEventListener("keypress", function (event) {
        if (event.code === "Enter") {
            event.preventDefault();
            sendPost();
        }
    });

    if (!ws) {
        setInterval(updatePost, 5000);
    }
}

function createPostHTML(postJSON) {
    const username = postJSON.author;
    const message = postJSON.content;
    const messageId = postJSON.id;
    const likesNumber = postJSON.likes.length;
    const imagePath = postJSON.image_path;
    const top = postJSON.top
    const left = postJSON.left


    let imageTag = '';

    if (username != "Guest") {
        imageTag = `<img src="${imagePath}" class="postImage">`;

    }

    let windowTextList = [
        "✉️ You've got mail!",
        "✉️ You've got mail!",
        "✉️ You've got mail!",
        "✉️ You've got mail!",
        "✉️ You've got mail!",
        "✉️ You've got mail!",
        "✉️ You've got mail!",
        "✉️ You've got mail!",
        "✉️ You've got mail!",
        "✉️ You've got mail!",
        "✉️ You've got mail!",
        "✉️ You've got mail!",
        "✉️ You've got mail!",
        "✉️ You've got mail!",
        "✉️ You've got mail!",
        "✉️ The end is near!",
        "🚨 CRITICAL ERROR!",
        "⚠️ Warning!",
        "🎉 CONGRATULATIONS, YOU'VE WON!",
        "🏛️ Message from the US Government:",
    ]

    const numericId = parseInt(messageId, 16);
    const index = numericId % windowTextList.length;

    let windowText = windowTextList[index];


    let postHTML = `<div class="window postwindow draggable" id="${messageId}" style="top: ${top}%; left: ${left}%">
            <div class="title-bar">
                <div class="title-bar-text">
                    ${windowText}
                </div>
    
                <div class="title-bar-controls">
                    <button aria-label="Close" onclick="deletePost('${messageId}')"></button>
                </div>
            </div>
            <div class="window-body">
                ${imageTag}
                <p>📬 Message From <b>${username}</b></p>
                <hr>
                <p>${message}</p>
                <section class="field-row" style="justify-content: flex-end">
                    <button class="like-btn" onclick="likePost('${messageId}')" >Like (${likesNumber})</button>
                </section>
            </div>
    </div>`;



    return postHTML;
}

function displayPost(messageJSON) {
    const chatMessages = document.getElementById("post-list");
    const postHTML = createPostHTML(messageJSON);
    chatMessages.insertAdjacentHTML('afterbegin', postHTML);

    const newlyAddedPost = chatMessages.querySelector('.window');

    const maxZIndex = getMaxZIndex('.window');
    newlyAddedPost.style.zIndex = maxZIndex + 1;


    newlyAddedPost.classList.add('windowShake');

    newlyAddedPost.addEventListener('animationend', function () {
        this.classList.remove('windowShake');
    }, { once: true });

    makeDraggable();
}

function getMaxZIndex(selector) {
    const elements = document.querySelectorAll(selector);
    let maxZIndex = 0;
    elements.forEach(element => {
        const zIndex = parseInt(window.getComputedStyle(element).zIndex);
        if (!isNaN(zIndex) && zIndex > maxZIndex) {
            maxZIndex = zIndex;
        }
    });
    return maxZIndex;
}


document.addEventListener('DOMContentLoaded', () => {

    if (ws) {
        initWS()
    }


    // Event listener for when the WebSocket connection is established
    socket.on('connect', function (data) {

    });

    socket.on('disconnect', function (data) {

    });

    // Event listener for when a message is received from the server
    socket.on('message', function (data) {
        // console.log('Received message:', data);
    });

    socket.on('recieve_gilbert_thoughts', function (data) {
        // console.log('Received thought:', data.message);
        update_gilb_thought(data.message)
    });

    socket.on('start_gilbert', function (data) {
        // console.log('gilbert starting!');
        audioDict.startup.play()
        update_gilb_thought("i'm gilbert!!!")

        let button = document.getElementById('pet_button');
        button.disabled = false;

    });

    socket.on('gilbert_die', function (data) {
        // console.log('gilbert died!');
        audioDict.dead.play()
        update_gilb_thought("i died...")

        document.getElementById('website-title').innerHTML = `Yap Chat`;

        let pet_button = document.getElementById('pet_button');
        pet_button.disabled = true;

        let feed_button = document.getElementById('feed_button');
        feed_button.disabled = true;

        document.getElementById('gilbert_stage_explanation').innerText = `Gilbert has passed away...`;



        // reset all to normal
        setTimeout(function () {
            feed_button.disabled = false;
            update_gilb_thought("i wish someone would give me some food...")

            document.getElementById('gilbert_health_stats').innerHTML = `Nothing here yet...`;
            document.getElementById('gilbert_hunger_stats').innerHTML = ``;
            document.getElementById('gilbert_seconds_alive').innerHTML = ``;

            document.getElementById('gilbert_happiness_stats').innerHTML = ``;
            document.getElementById('gilbert_title_bar').innerText = `❓ Gilbert`;
            document.getElementById('gilbert_seconds_alive').innerHTML = ``;

            document.getElementById('gilbert_status').innerHTML = `<b>Gilbert</b>`;

            document.getElementById('gilbert_emoji').innerText = `❓`;

            document.getElementById('gilbert_stage_explanation').innerText = ``;
            document.getElementById('gilbert_gold').innerHTML = ``;
            document.getElementById('gilbert_level').innerHTML = ``;
            document.getElementById('gilbert_xp').innerHTML = ``;

            document.getElementById("pet_button").style.display = "none"
            document.getElementById("gilbert_upgrades").hidden = true

            // remove stats div
            const aboutGilbert = document.getElementById("aboutGilbertDiv");
            aboutGilbert.style.display = "none";
            clearEnemiesMain()

        }, 21000);

    });

    socket.on('recieve_gilbert_stats', function (data) {
        // console.log('Received gilbert stats:', data);   

        let status = "dead"
        if (data.alive == true) {
            status = "alive"
        }

        let emoji = "😎"
        let health = data.health

        if (health >= 90) {
            emoji = "😎"
        } else if (health >= 75) {
            emoji = "🙂‍"
        } else if (health >= 50) {
            emoji = "😐"
        } else if (health >= 25) {
            emoji = "😟"
        } else if (health >= 1) {
            emoji = "😔"
        } else {
            emoji = "💀"
        }

        // show stats div
        const aboutGilbert = document.getElementById("aboutGilbertDiv");
        if (aboutGilbert.style.display === "none") {
            aboutGilbert.style.display = "initial";
        }

        gilbert_stage = data.stage

        // only display certain things depending on the stage of gilbert
        if (gilbert_stage >= 0) {
            // update statistics box
            document.getElementById('gilbert_health_stats').innerHTML = `❤️ Health: <b>${data.health}</b>/${data.max_health}`;
            document.getElementById('gilbert_hunger_stats').innerHTML = `🍇 Hunger: <b>${data.hunger}</b>/100`;
            document.getElementById('gilbert_seconds_alive').innerHTML = `🕑 Time Alive: <b>${data.seconds_alive} seconds</b>`;

            // website title
            document.getElementById('website-title').innerHTML = `Gilbert (${data.health}/100 hp)`;

            // gilbert status
            document.getElementById('gilbert_status').innerHTML = `<b>Gilbert</b> (Level ${data.level})`;

            // gilbert emoji picture
            document.getElementById('gilbert_emoji').innerText = `${emoji}`;

            // gilbert's title bar
            document.getElementById('gilbert_title_bar').innerText = `${emoji} Gilbert (${data.health}/${data.max_health} hp)`;

            // update stage explanation
            document.getElementById('gilbert_stage_explanation').innerText = `Don't let Gilbert's hunger get too low!`;

        }

        if (gilbert_stage >= 1) {
            // show happiness stat
            const happinessStat = document.getElementById('gilbert_happiness_stats');

            happinessStat.innerHTML = `🌈 Happiness: <b>${data.happiness}</b>/100`;

            // show feed button
            const petButton = document.getElementById("pet_button");
            // play an animation on join
            if (petButton.style.display === "none") {

                audioDict.upgrade.play()

                petButton.classList.add('windowShake');

                setTimeout(function () {
                    petButton.classList.remove('windowShake')
                }, 1000);

                petButton.style.display = "initial";
            }

            // update stage explanation
            document.getElementById('gilbert_stage_explanation').innerText = `Give Gilbert treats to keep him happy!`;
        }

        if (gilbert_stage >= 2) {

            if (!document.getElementById('gilbert_gold').innerHTML) {
                audioDict.upgrade.play()
            }

            document.getElementById('gilbert_level').innerHTML = `🏰 Level: <b>${data.level}</b>`;
            document.getElementById('gilbert_gold').innerHTML = `🪙 Gold: <b>${data.gold}</b>`;
            document.getElementById('gilbert_xp').innerHTML = `✨ XP: <b>${data.xp}</b>/${data.xp_to_levelup}`;
            document.getElementById('gilbert_stage_explanation').innerText = `gilbert is ${data.status}`;
        }

        if (gilbert_stage >= 3) {

            const gilbertUpgrades = document.getElementById("gilbert_upgrades");
            if (gilbertUpgrades.hasAttribute("hidden")) {

                audioDict.upgrade.play()

                gilbertUpgrades.classList.add('windowShake');

                setTimeout(function () {
                    gilbertUpgrades.classList.remove('windowShake')
                }, 1000);

                gilbertUpgrades.removeAttribute("hidden");
                makeDraggable()
            }

            document.getElementById('shop-gold-display').innerHTML = `🪙 Your Gold: <b>${data.gold}</b>`;

            // damage updates
            document.getElementById('damage-upgrade-stat').innerHTML = `Damage: <b> ${data.damage}</b> / 10`;

            if (data.upgrades.damage_cost == "max") {
                document.getElementById('damage-upgrade-button').innerHTML = `<b>Max Upgrade!</b>`;
                document.getElementById('damage-upgrade-button').disabled = true
            } else {
                document.getElementById('damage-upgrade-button').innerHTML = `<b>Upgrade</b> (${data.upgrades.damage_cost} gold)`;
            }

            // defense
            document.getElementById('defense-upgrade-stat').innerHTML = `Defense: <b> ${data.defense} %</b>`;

            if (data.upgrades.defense_cost == "max") {
                document.getElementById('defense-upgrade-button').innerHTML = `<b>Max Upgrade!</b>`;
                document.getElementById('defense-upgrade-button').disabled = true
            } else {
                document.getElementById('defense-upgrade-button').innerHTML = `<b>Upgrade</b> (${data.upgrades.defense_cost} gold)`;
            }


            // max health
            document.getElementById('health-upgrade-stat').innerHTML = `Max Health: <b> ${data.max_health}</b> / 200`;

            if (data.upgrades.health_cost == "max") {
                document.getElementById('health-upgrade-button').innerHTML = `<b>Max Upgrade!</b>`;
                document.getElementById('health-upgrade-button').disabled = true
            } else {
                document.getElementById('health-upgrade-button').innerHTML = `<b>Upgrade</b> (${data.upgrades.health_cost} gold)`;
            }

            // regen
            document.getElementById('regen-upgrade-stat').innerHTML = `Regeneration: <b> ${data.regen} </b> hp`;
            
            if (data.upgrades.regen_cost == "max") {
                document.getElementById('regen-upgrade-button').innerHTML = `<b>Max Upgrade!</b>`;
                document.getElementById('regen-upgrade-button').disabled = true
            } else {
                document.getElementById('regen-upgrade-button').innerHTML = `<b>Upgrade</b> (${data.upgrades.regen_cost} gold)`;
            }

            // luck
            document.getElementById('luck-upgrade-stat').innerHTML = `Loot Luck: <b> ${data.luck} %</b>`;

            if (data.upgrades.luck_cost == "max") {
                document.getElementById('luck-upgrade-button').innerHTML = `<b>Max Upgrade!</b>`;
                document.getElementById('luck-upgrade-button').disabled = true
            } else {
                document.getElementById('luck-upgrade-button').innerHTML = `<b>Upgrade</b> (${data.upgrades.luck_cost} gold)`;
            }

            // gold
            document.getElementById('GoldFarm-stat').innerHTML = `Passive Gold:  <b> ${data.GoldFarm}</b> gold`;

            if (data.upgrades.luck_cost == "max") {
                document.getElementById('GoldFarm-upgrade-button').innerHTML = `<b>Max Upgrade!</b>`;
                document.getElementById('GoldFarm-upgrade-button').disabled = true
            } else {
                document.getElementById('GoldFarm-upgrade-button').innerHTML = `<b>Upgrade</b> (${data.upgrades.GoldFarm_cost} gold)`;
            }

            // food 
            document.getElementById('Food-stat').innerHTML = `Food gain : <b> ${data.Food} </b>`;

            if (data.upgrades.luck_cost == "max") {
                document.getElementById('Food-button').innerHTML = `<b>Max Upgrade!</b>`;
                document.getElementById('Food-button').disabled = true
            } else {
                document.getElementById('Food-button').innerHTML = `<b>Upgrade</b> (${data.upgrades.Food_cost} gold)`;
            }
            
            // document.getElementById('Treat-button').innerHTML = `Treat: <b> ${data.Treats} %</b>`;

            // if (data.upgrades.luck_cost == "max") {
            //     document.getElementById('Treat-button').innerHTML = `<b>Max Upgrade!</b>`;
            //     document.getElementById('Treat-button').disabled = true
            // } else {
            //     document.getElementById('Treat-button').innerHTML = `<b>Upgrade</b> (${data.upgrades.Treat_cost} gold)`;
            // }
        }





        // handle gilbert animations
        let pic = document.getElementById('gilbert_emoji')

        if (status == "alive") {
            if (!pic.classList.contains('gilbert-anim-alive')) {
                pic.classList.add('gilbert-anim-alive');
            }
        } else {
            pic.classList.remove('gilbert-anim-alive');
        }

    });


    socket.on('new_enemy_group', function (data) {

        // console.log('New enemy group:', data);

        for (const [id, monster] of Object.entries(data)) {
            // console.log(monster)
            setTimeout(() => {
           
                createEnemy(monster);

                if (monster.type == "bonus") {
                    audioDict.portal.play()
                } else {
                    audioDict.enemy.play()
                }
        
                }, Math.floor(Math.random() * 3) * getRandomDelay());

        }



    });

    socket.on('update_enemy_frontend', function (data) {

        // console.log('enemy interaction:', data);

        if (data.interaction_type == "player_attack") {
            document.getElementById(`monster_health_${data.id}`).innerHTML = `❤️ Health: <b>${data.health}</b>`
            document.getElementById(`monster_titleid_${data.id}`).innerHTML = `${data.emoji} ${data.name} (${data.health} hp)`
        } else if (data.interaction_type == "attack_gilbert") {
            var audio = audioDict.hit
            audio.volume = 0.2
            audio.play()

            const postElement = document.getElementById(data.id);
            if (postElement) {
                postElement.classList.add('wobble-hor-bottom');
                postElement.addEventListener('animationend', function () {
                    postElement.classList.remove('wobble-hor-bottom');
                });
            }
        } else if (data.interaction_type == "loot") {
        

            const postElement = document.getElementById(data.id);
            if (postElement) {
                
                if (audioDict.pickup.paused) { 
                    audioDict.pickup.play();
                } else {
                    audioDict.pickup.currentTime = 0;
                    audioDict.pickup.play();
                }
                

                postElement.classList.add('delete-animation');
                postElement.addEventListener('animationend', function () {

                    postElement.remove();
                });
            }

        } else if (data.interaction_type == "death") {


            // delete window + animation
            const postElement = document.getElementById(data.id);
            if (postElement) {
                postElement.classList.add('delete-animation');
                postElement.addEventListener('animationend', function () {

                    postElement.remove();
                    
                    
                    audioDict.good.play()
                    createLoot(data)


                });
            }

        }
    });

    // Event listener for when a 'new_post' event is received from the server
    socket.on('new_post', function (data) {

        if (data.hidden == true) {
            return
        }

        // console.log('New post:', data);


        const messageType = data.messageType;
        // console.log(messageType)

        if (messageType === "post") {
            displayPost(data);
            audioDict.chord.play()

        } else if (messageType === "shame") {
            displayPost(data);

            const existingUser = document.getElementById("list_id_" + data.author);
            if (!existingUser) {
                document.getElementById('user-list').innerHTML += `<li id="list_id_${data.author}">${data.author}</li>`;
                audioDict.tada.play()

                const containerElement = document.getElementById('user-div');
                if (containerElement) {
                    containerElement.classList.add('jello-horizontal');
                    containerElement.addEventListener('animationend', function () {
                        containerElement.classList.remove('jello-horizontal');
                    });
                }
            } else {
                audioDict.chord.play()
            }

        }

    });

    socket.on('statistics', function (data) {
        // console.log('stats:', data);

        document.getElementById('posts-created').innerHTML = `Posts Created: <b>${data.posts_created}</b>`;
        document.getElementById('posts-deleted').innerHTML = `Posts Deleted: <b>${data.posts_deleted}</b>`;
        document.getElementById('unique-users').innerHTML = `Unique Users: <b>${data.unique_users}</b>`;
        document.getElementById('global-likes').innerHTML = `Global Likes: <b>${data.global_likes}</b>`;
        document.getElementById('longest_life').innerHTML = `Longest Gilbert Life: <b>${data.gilbert_longest_alive} seconds</b>`;

    });

    socket.on('post_deleted', function (data) {
        const postId = data.post_id;
        const postElement = document.getElementById(postId);
        if (postElement) {
            postElement.classList.add('delete-animation');
            audioDict.chimes.play()
            postElement.addEventListener('animationend', function () {

                postElement.remove();
            });
        }
    });

    socket.on('post_liked', function (data) {
        const postId = data.message_id;
        const likesNumber = data.likes;
        // console.log("like recieved, new likes: ", likesNumber, postId)
        const postElement = document.getElementById(postId);
        if (postElement) {

            postElement.classList.add('like-anim');
            // playWavSound("/static/sounds/DING.WAV");
            const likeButton = postElement.querySelector('.like-btn');
            if (likeButton) {

                likeButton.textContent = `Like (${likesNumber})`;
            }
            postElement.addEventListener('animationend', function () {
                postElement.classList.remove('like-anim');
            });

        }
    });

    socket.on('upgrade_purchase', function (data) {
        console.log("upgrade: ", data)

        // should really be in it's own function but whatever
        if (audioDict.upgrade.paused) { 
            audioDict.upgrade.play();
        } else {
            audioDict.upgrade.currentTime = 0;
            audioDict.upgrade.play();
        }

        const shopGold = document.getElementById("gilbert_upgrades");

        shopGold.classList.add('windowShake');

        setTimeout(function () {
            shopGold.classList.remove('windowShake')
        }, 500);


    });

});

function deletePost(postId) {
    socket.emit('delete_post', postId);
}

function makeDraggable() {
    document.querySelectorAll('.draggable').forEach(window => {
        window.addEventListener('mousedown', bringToFront);

        const titleBar = window.querySelector('.title-bar');
        if (titleBar) {
            titleBar.addEventListener('mousedown', startDragging);
        }
    });

    function bringToFront() {
        const windows = document.querySelectorAll('.draggable');
        const maxZIndex = Math.max(...Array.from(windows).map(win => parseInt(win.style.zIndex) || 1));
        this.style.zIndex = maxZIndex + 1;
    }

    function startDragging(event) {
        const window = this.closest('.draggable');
        if (window) {
            const rect = window.getBoundingClientRect();
            const offsetX = event.clientX - rect.left;
            const offsetY = event.clientY - rect.top;

            document.addEventListener('mousemove', dragWindow);
            document.addEventListener('mouseup', stopDragging);

            function dragWindow(event) {
                window.style.left = (event.clientX - offsetX) + 'px';
                window.style.top = (event.clientY - offsetY) + 'px';
            }

            function stopDragging() {
                document.removeEventListener('mousemove', dragWindow);
                document.removeEventListener('mouseup', stopDragging);
            }
        }
    }
}


function feedGilbert() {
    socket.emit('gilbert_start');

    socket.emit('update_gilbert', "feed");

    let button = document.getElementById('feed_button');
    button.disabled = true;
    button.classList.add('buttonClick');
    audioDict.minimize.play()

    setTimeout(function () {
        button.disabled = false;
        button.classList.remove('buttonClick')
    }, 1500);
}

function petGilbert() {
    socket.emit('update_gilbert', "pet");

    let button = document.getElementById('pet_button');
    button.disabled = true;
    button.classList.add('buttonClick');

    audioDict.minimize.play()

    setTimeout(function () {
        button.disabled = false;
        button.classList.remove('buttonClick')
    }, 1000);
}

function hurtGilbert() {
    socket.emit('update_gilbert', "hurt");

    let button = document.getElementById('hurt_button');
    button.disabled = true;
    button.classList.add('buttonClick');

    audioDict.minimize.play()

    setTimeout(function () {
        button.disabled = false;
        button.classList.remove('buttonClick')
    }, 1000);
}


function update_gilb_thought(message) {
    document.getElementById('gilbert_thoughts').innerHTML = message;

    // animation
    containerElement = document.getElementById('gilb_thought_container')

    if (containerElement) {
        containerElement.classList.add('jello-horizontal');
        containerElement.addEventListener('animationend', function () {
            containerElement.classList.remove('jello-horizontal');
        });
    }
}

function loginButton() {

    let button = document.getElementById('loginButton');
    button.disabled = true;
    button.classList.add('buttonClick');

    audioDict.minimize.play()

    setTimeout(function () {
        button.disabled = false;
        button.classList.remove('buttonClick')
    }, 1000);
}

function registerButton() {

    let button = document.getElementById('registerButton');
    button.disabled = true;
    button.classList.add('buttonClick');

    audioDict.minimize.play()

    setTimeout(function () {
        button.disabled = false;
        button.classList.remove('buttonClick')
    }, 1000);
}

function enemyInteraction(monsterID) {


    let button = document.getElementById(`buttonid_${monsterID}`);
    button.disabled = true;
    button.classList.add('buttonClick');

    setTimeout(function () {
        button.disabled = false;
        button.classList.remove('buttonClick')
    }, 1000);

    var audio = audioDict.hit
    audio.volume = 0.2
    audio.play()


    socket.emit('enemy_interaction', monsterID);
}

function enemyLoot(monsterID) {


    let button = document.getElementById(`buttonid_${monsterID}`);
    button.disabled = true;
    button.classList.add('buttonClick');

    setTimeout(function () {
        button.disabled = false;
        button.classList.remove('buttonClick')
    }, 1000);

    

    const postElement = document.getElementById(monsterID);
    if (postElement) {
        audioDict.pickup.play()
        postElement.classList.add('delete-animation');
        postElement.addEventListener('animationend', function () {

            postElement.remove();
        });
    }


    socket.emit('enemy_interaction', monsterID);
}


function createEnemy(messageJSON) {
    const chatMessages = document.getElementById("enemy-list");
    const postHTML = createEnemyHTML(messageJSON);
    chatMessages.insertAdjacentHTML('afterbegin', postHTML);

    const newlyAddedPost = chatMessages.querySelector('.window');

    const maxZIndex = getMaxZIndex('.window');
    newlyAddedPost.style.zIndex = maxZIndex + 1;


    newlyAddedPost.classList.add('windowShake');

    newlyAddedPost.addEventListener('animationend', function () {
        this.classList.remove('windowShake');
    }, { once: true });

    makeDraggable();
}


function createEnemyHTML(enemyJSON) {
    const top = enemyJSON.top;
    const left = enemyJSON.left;
    const health = enemyJSON.health;
    const emoji = enemyJSON.emoji;
    const description = enemyJSON.description;
    const name = enemyJSON.name;
    const id = enemyJSON.id;
    const damage = enemyJSON.damage_to_gilbert;
    const level = enemyJSON.level;
    const animation = enemyJSON.animation
    const attackSpeed = enemyJSON.attack_speed
    let type = enemyJSON.type
    let enemyStats = ``

    if (type == "bonus") {
        type = "purple-highlight"
    } else {
        type = "red"
        enemyStats = `
        <ul class="tree-view" style="margin-top: 5px">
            <li id="monster_health_${id}">❤️ Health: <b>${health}</b></li>
            <li id="enemy_damage">🔪 Damage: <b>${damage}</b></li>
        </ul>`
    }


    let enemyHTML = `
    <div class="draggable window enemyWindow" id="${id}" style="top: ${top}%; left: ${left}%; overflow: hidden">
            <div class="title-bar ${type}">
                <div class="title-bar-text" id="monster_titleid_${id}">
                ${emoji} ${name} (${health} hp)
                </div>
                <div class="title-bar-controls">
                    <button title="An enemy! Attack it before it attacks gilbert!" aria-label="Help"></button>
                </div>
            </div>
            <div class="window-body">
                <div class="centerGilbert">
                    <p class="enemy-anim" style="font-size: 45px; padding: 3px; margin: 3px; text-shadow: 2px 1px 2px rgba(3, 3, 3, 0.349)">${emoji}</p>
                    <p>${emoji}<b>${name}</b> (Level ${level})</p>
                    <i>${description}</i>
                </div>   
                ${enemyStats}
                <section class="field-row ${animation}" style="justify-content: center; margin-top: 7px">
                    <button class="like-btn" onclick="enemyInteraction('${id}')" id="buttonid_${id}">⚔️ Attack</button>
                </section>
            </div>
        </div>
    `;

    return enemyHTML;
}

function createLootHTML(enemyJSON) {
    const top = enemyJSON.top;
    const left = enemyJSON.left;
    const name_of_enemy = enemyJSON.name;
    const id = enemyJSON.id;
    const gold = enemyJSON.gold_drop;
    const xp = enemyJSON.xp_drop;
    const health = enemyJSON.health_drop;
    const emoji = enemyJSON.emoji;
    let healthHTML = ``
    let goldHTML = ``
    let xpHTML = ``


    if (health) {
        healthHTML = `<li>🩷 Health: <b>${health}</b></li>`
    }
    if (gold) {
        goldHTML = `<li>🪙 Gold: <b>${gold}</b></li>`
    }
    if (xp) {
        xpHTML = `<li>✨ XP: <b>${xp}</b></li>`
    }


    let enemyHTML = `<div class="draggable window lootWindow" id="${id}" style="top: ${top}%; left: ${left}%">
            <div class="title-bar gold-highlight">
                <div class="title-bar-text">
                    💰 Loot!
                </div>
                <div class="title-bar-controls">
                    <button title="Loot dropped from an enemy!" aria-label="Help"></button>
                </div>
            </div>
            <div class="window-body">
                <div class="centerGilbert">
                <p class="enemy-anim" style="font-size: 45px; padding: 3px; margin: 3px; text-shadow: 2px 1px 2px rgba(3, 3, 3, 0.349)">💰</p>
                    <p><b>${emoji}${name_of_enemy} defeated!</b></p>
                    <i></i>
                </div>   

                <hr>

                <p>📜 Items Dropped</p>
                    <ul class="tree-view">
                        ${goldHTML}
                        ${xpHTML}
                        ${healthHTML}
                    </ul>

                <section class="field-row" style="justify-content: center; margin-top: 7px">
                    <button class="like-btn" onclick="enemyLoot('${id}')" id="buttonid_${id}">Grab Loot</button>
                </section>
            </div>
    </div>`;

    return enemyHTML;
}

function createLoot(messageJSON) {
    const chatMessages = document.getElementById("enemy-list");
    const postHTML = createLootHTML(messageJSON);
    chatMessages.insertAdjacentHTML('afterbegin', postHTML);

    const newlyAddedPost = chatMessages.querySelector('.window');

    const maxZIndex = getMaxZIndex('.window');
    newlyAddedPost.style.zIndex = maxZIndex + 1;


    newlyAddedPost.classList.add('windowShake');

    newlyAddedPost.addEventListener('animationend', function () {
        this.classList.remove('windowShake');
    }, { once: true });

    makeDraggable();
}


function setActiveWindow(windowId) {
	const windowLabel = `shop-tab-${windowId}`;
	const tabLabel = `shop-tab-label-${windowId}`;
	
	// hide all windows
	var windows = document.querySelectorAll('.window[role="tabpanel"]');
	windows.forEach(function (window) {
		window.setAttribute("hidden", true);
	});
	var tabWindows = document.querySelectorAll('[role="tab"]');
	tabWindows.forEach(function (window) {
		window.setAttribute("aria-selected", false);
	});

	// show selected windows/tabs
	var activeWindow = document.getElementById(windowLabel);
	if (activeWindow) {
		activeWindow.removeAttribute("hidden");
	}
	var activeWindow = document.getElementById(tabLabel);
	if (activeWindow) {
		activeWindow.setAttribute("aria-selected", true);

        if (audioDict.click.paused) { 
            audioDict.click.play();
        } else {
            audioDict.click.currentTime = 0;
            audioDict.click.play();
        }

	}
}

function shopInteraction(upgrade_type) {
    socket.emit('shop_interaction', upgrade_type);
    
    let button = document.getElementById(`${upgrade_type}-upgrade-button`);
    button.classList.add('buttonClick');

    setTimeout(function () {
        button.classList.remove('buttonClick')
    }, 1000);
}






document.addEventListener('DOMContentLoaded', makeDraggable);