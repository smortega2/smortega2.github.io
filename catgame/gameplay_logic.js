function setup_game(){
	var letter = generateLetter();
	var categories = generateCategories();
	var url = buildUrl(letter,categories);
	window.location = url;

}

function buildUrl(letter, categories){
	var url = "game.html?letter=" + letter;
	url = url + "&c0=" + categories[0];
	url = url + "&c1=" + categories[1];
	url = url + "&c2=" + categories[2];
	url = url + "&c3=" + categories[3];
	url = url + "&c4=" + categories[4];
	url = url + "&c5=" + categories[5];
	url = url + "&c6=" + categories[6];
	url = url + "&c7=" + categories[7];
	url = url + "&c8=" + categories[8];
	url = url + "&c9=" + categories[9];
	url = url + "&c10=" + categories[10];
	url = url + "&c11=" + categories[11];
	return url;
}

function generateLetter(){
	var letters = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','R','S','T','W'];
	var letter = letters[Math.floor(Math.random()*letters.length)];
	return letter;
}

function generateCategories(){
	var categories = [	
					"things_you_don't_want_in_the_house",
					"colors",
					"things_you_learned_as_a_kid",
					"seen_at_a_concert",
					"people_you_admire",
					"on_a_menu",
					"found_at_the_beach",
					"comes_in_pairs_or_sets",
					"things_at_a_birthday_party",
					"nicknames",
					"in_a_freezer",
					"things_that_need_to_be_cleaned",
					"boy's_names",
					"foods_you_eat_for_breakfast",
					"an_animal",
					"things_that_are_cold",
					"insects",
					"tv_shows",
					"things_that_grow",
					"fruits",
					"things_that_are_black",
					"school_subjects",
					"movie_titles",
					"musical_instruments",
					"authors",
					"bodies_of_water",
					"a_bird",
					"countries",
					"cartoon_characters",
					"holidays",
					"things_that_are_square",
					"something_that_you_would_see_in_canada",
					"clothing",
					"a_relative/_family_member",
					"games",
					"famous_athletes",
					"things_that_are_green",
					"things_you_hate",
					"liquids",
					"microwavable_things",
					"things_that_smell_bad",
					"types_of_pain",
					"reasons_to_get_divorced",
					"coastal_cities",
					"famous_last_words",
					"things_you_lick",
					"tight_places",
					"things_you_open",
					"big_words_(10+)",
					"jobs_you_don't_want",
					"villains",
					"songs",
					"things_kids_stick_up_their_nose",
					"things_you_do_when_no_one_is_looking",
					"the_80's",
					"bad_movies",
					"kinds_of_soup",
					"things_found_in_new_york",
					"spicy_foods",
					"things_you_shouldn't_touch",
					"things_at_a_carnival",
					"places_to_hang_out",
					"animal_noises",
					"computer_programs",
					"honeymoon_spots",
					"things_you_buy_for_kids",
					"things_that_can_kill_you",
					"reasons_to_take_out_a_loan",
					"words_associated_with_winter",
					"things_to_do_on_a_date",
					"historic_events",
					"things_you_store_items_in",
					"things_you_do_every_day",
					"things_you_get_in_the_mail",
					"things_you_save_up_to_buy",
					"things_you_sit_in/on",
					"reasons_you_make_a_phone_call",
					"types_of_weather",
					"titles_people_can_have",
					"things_that_have_buttons",
					"items_you_take_on_a_trip",
					"things_that_have_wheels",
					"reasons_to_call_911",
					"things_that_make_you_smile",
					"ways_to_kill_time",
					"things_that_can_get_you_fired",
					"hobbies",
					"holiday_activities",
					"movie_stars",
					"heroes",
					"gifts/presents",
					"terms_of_endearment",
					"kinds_of_dances",
					"vehicles",
					"tropical_locations",
					"sandwiches",
					"items_in_a_catalog",
					"world_leaders/_politicians",
					"school_supplies",
					"excuses_for_being_late",
					"ice_cream_flavors",
					"television_stars",
					"things_that_jump",
					"articles_of_clothing",
					"desserts",
					"car_parts",
					"things_found_on_a_map",
					"4-letter_words",
					"items_in_a_refrigerator",
					"street_names",
					"things_found_in_the_ocean",
					"foods_that_kids_hate",
					"things_in_a_coffee_bar",
					"things_you_mix_up",
					"furniture",
					"presidents",
					"product_names"
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
	var letter = generateLetter();//getUrlVars()["letter"];
	document.getElementById('letter').innerHTML = letter;
	categories = generateCategories();
	for(var i=0; i < 12; i++){
		var category = categories[i];//getUrlVars()["c"+i]
		category = formatCategory(category);
		displayCategoryInList(category);
	}
}

function displayCategoryInList(category){
	var list = document.getElementById('ordered_list');
	var list_element = document.createElement('li');
	list_element.appendChild(document.createTextNode(category));
	list.appendChild(list_element);
}

function formatCategory(category){
	category = category.replace(/_/g, " "); //corrects ' '
	category = category.replace(/%27/g, "'"); //corrects ''' 
	return category;
}

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
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

