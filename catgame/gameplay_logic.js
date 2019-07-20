function setup_game(){
	var letter = generateLetter();
	var categories = generateCategories();
	window.location = "game.html";
}

function generateLetter(){
	var letters = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','R','S','T','W'];
	var letter = letters[Math.floor(Math.random()*letters.length)];
	return letter;
}

function generateCategories(){
	var categories = [	
					"things you don't want in the house",
					"colors",
					"things you learned as a kid",
					"seen at a concert",
					"people you admire",
					"on a menu",
					"found at the beach",
					"comes in pairs or sets",
					"things at a birthday party",
					"nicknames",
					"in a freezer",
					"things that need to be cleaned",
					"boy's names",
					"foods you eat for breakfast",
					"an animal",
					"things that are cold",
					"insects",
					"tv shows",
					"things that grow",
					"fruits",
					"things that are black",
					"school subjects",
					"movie titles",
					"musical instruments",
					"authors",
					"bodies of water",
					"a bird",
					"countries",
					"cartoon characters",
					"holidays",
					"things that are square",
					"something that you would see in canada",
					"clothing",
					"a relative/ family member",
					"games",
					"famous athletes",
					"things that are green",
					"things you hate",
					"liquids",
					"microwavable things",
					"things that smell bad",
					"types of pain",
					"reasons to get divorced",
					"coastal cities",
					"famous last words",
					"things you lick",
					"tight places",
					"things you open",
					"big words (10+)",
					"jobs you don't want",
					"villains",
					"songs",
					"things kids stick up their nose",
					"things you do when no one is looking",
					"the 80's",
					"bad movies",
					"kinds of soup",
					"things found in new york",
					"spicy foods",
					"things you shouldn't touch",
					"things at a carnival",
					"places to hang out",
					"animal noises",
					"computer programs",
					"honeymoon spots",
					"things you buy for kids",
					"things that can kill you",
					"reasons to take out a loan",
					"words associated with winter",
					"things to do on a date",
					"historic events",
					"things you store items in",
					"things you do every day",
					"things you get in the mail",
					"things you save up to buy",
					"things you sit in/on",
					"reasons you make a phone call",
					"types of weather",
					"titles people can have",
					"things that have buttons",
					"items you take on a trip",
					"things that have wheels",
					"reasons to call 911",
					"things that make you smile",
					"ways to kill time",
					"things that can get you fired",
					"hobbies",
					"holiday activities",
					"movie stars",
					"heroes",
					"gifts/presents",
					"terms of endearment",
					"kinds of dances",
					"vehicles",
					"tropical locations",
					"sandwiches",
					"items in a catalog",
					"world leaders/ politicians",
					"school supplies",
					"excuses for being late",
					"ice cream flavors",
					"television stars",
					"things that jump",
					"articles of clothing",
					"desserts",
					"car parts",
					"things found on a map",
					"4-letter words",
					"items in a refrigerator",
					"street names",
					"things found in the ocean",
					"foods that kids hate",
					"things in a coffee bar",
					"things you mix up",
					"furniture",
					"presidents",
					"product names",
					"movie characters",
					"drinks",
					"sports teams",
					"cleaning supplies",
					"recreational activities",
					"female disney characters",
					"airlines"
					];
	var inds = chance.unique(chance.natural, 12, {min: 0, max: categories.length-1});
	var category_slice = inds.map(i => categories[i]);
	return category_slice;
}

function startGame(){
	displayVariables();
	startClock();
}

function displayVariables(){
	var letter = generateLetter();
	document.getElementById('letter').innerHTML = letter;
	categories = generateCategories();
	for(var i=0; i < 12; i++){
		var category = categories[i];
		displayCategoryInList(category);
	}
}

function displayCategoryInList(category){
	var list = document.getElementById('ordered_list');
	var list_element = document.createElement('li');
	list_element.appendChild(document.createTextNode(category));
	list.appendChild(list_element);
}

var countdown_time = 3;
function startClock(){
	var fiveMinutes = 60 * countdown_time, display = document.querySelector('#running_clock');
    updateClock(fiveMinutes, display);
}

function updateClock(duration, display){
	var timer = duration, minutes, seconds;
	setInterval(function () {
		minutes = parseInt(timer / 60, 10)
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = minutes + ":" + seconds;

        --timer;
        if(timer < 30){
          document.getElementById('running_clock').style.color = "#ed0b17";
        }
        if (timer < 0) {
            timer = 0;
            document.body.style.backgroundColor = "#503860";
        }
    }, 1000);
}

