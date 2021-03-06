// register command for users to add roles
// format: !register <gender> <pronoun> <orientation> <mtf|ftm>

// Require Ramda. Always require Ramda.
var R = require('ramda');

var roles = require('../config/roles.js');

// regexes for parsing command input
var gender = /\smale|\sfemale|\sgenderfluid|\snonbinary|\squestioning/i
var genRoles = /\sstraight|\sgay|\slesbian|\sbi|\span|\sace|\sdemi|\spoly|\squeer|\sshe|\she|\sthey|\sxe/ig
var transStatus = /\smtf|\sftm/i

var normalize = R.compose(R.toLower, R.trim);

var getRoleID = R.flip(R.prop)(roles);

var normalizeToID = R.compose(
  getRoleID,
  normalize
);

//Checks wheter the user has already registered.  
function register(message, bot){
	
	if(checkUser){
		//user has already registered
		checkUser(message, bot);
		return;
	}
	else{
		bot.reply(message, 'Setting Roles...', function() {
			registerUser(message, bot);
			return;
		});				
	}		
		
}

//if a member already has a role, tell them to use the !setpreferences function.
function checkUser(message, bot){
	var membervar;
	for (var i=0; i<bot.servers[0].roles.length; i++){
		if(bot.servers[0].roles[i].name == "Member"){
			membervar = bot.servers[0].roles[i];
		}
	}
	//console.log(membervar)
	if(bot.memberHasRole(message.author, membervar)){
		bot.reply(message, "You have already registered.  Please use the \"!appendrole...\" function " +
			"to append a role to yourself, or \"!deleterole...\" to delete a role from yourself.");
		return true;
	}
	else{
		return false;
	}	
}
	
var registerUser = function(message, bot) {
  // message.client.sendMessage(message.channel, "I'm a bot! I'm working!");
  
	
  var userRoles = [roles["Member"]];
  var error = false;

  var userGender = R.match(gender, message.content);
  if (userGender.length === 0) {
    error = true;
    //message.client.sendMessage(message.channel, "Must include one gender indentifier.");
	bot.reply(message, "Must include one gender indentifier.");
  } else if (userGender.length > 1) {
    error = true;
    //message.client.sendMessage(message.channel, "Cannot have more than one gender identifier.");
	bot.reply(message, "Cannot have more than one gender identifier.");
  } else {
    // add gender role to roles list
    userRoles.push(R.compose(
      normalizeToID,
      R.prop(0)
    )(userGender));
  }

  var userGenRoles = R.match(genRoles, message.content);

  userRoles = userRoles.concat(R.map(normalizeToID, userGenRoles));

  var userTransStatus = R.match(transStatus, message.content);
  if (userTransStatus.length > 1) {
    error = true;
    //message.client.sendMessage(message.channel, "Can only have one transition identifier");
	bot.reply(message, "Can only have one transition identifier");
  } else if (userTransStatus.length > 0) {
    userRoles.push(R.compose(
      normalizeToID,
      R.prop(0)
    )(userTransStatus));
  }

  if (!error) {
    message.client.addMemberToRole(message.author, userRoles, function(err) {
      var response = "";
  
      if (err) {
        response = "Sorry, there was an error, please message a mod or admin."
        console.error(err, message.content);
      } else {
        response = "Success! Your roles have been set."
      }
  
      //message.client.sendMessage(message.channel, response);
	  bot.reply(message, response);
    });
  }
      
};

module.exports = register;
