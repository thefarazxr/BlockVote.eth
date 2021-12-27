
App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,

  init: function () {
    return App.initWeb3();

  },

  initWeb3: function () {
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    /*if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }*/
    return App.initContract();
  },

  initContract: function () {
    $.getJSON("Election.json", function (election) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Election = TruffleContract(election);
      // Connect provider to interact with contract
      App.contracts.Election.setProvider(App.web3Provider);
      App.listenForEvents();  //call this whenver we intialize the contract
      App.listenForAccountChange();
      return App.render();
    });
  },


  //Listen for events emitted from the contract
  listenForEvents: function () {
    //Restart Chrome if you are unable to receive this event.
    // This is a known issue with Metamask
    //https://github.com/MetaMask/metamask-extension/issues/2393
    App.contracts.Election.deployed().then(function (instance) {
      instance.votedEvent({}, {     //1st arg-empty =>for FILTERS
        fromBlock: 0,               //2nd arg-> META DATA here frm 1st block to LAST<latest> block.
        toBlock: 'latest'
      }).watch(function (error, event) {
        console.log("event triggered", event)
        // Reload when a new vote is recorded
        App.render();
      });
    });
  },
  //Below code will detect change in metaMask accounts and reload the page!(Ctrl/Cmd +R)
  listenForAccountChange: function () {
    window.ethereum.enable();
    window.ethereum.on('accountsChanged', function (accounts) {
      console.log('accountsChanges', accounts);
      window.location.reload();   //Reload the page JS CODE
      //App.account = accounts[0];
      //App.render();
    })
  },

  render: function () {
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // Load account data DEPRECATED METHOD
    /*web3.eth.getCoinbase(function (err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    })*/

    //ethereum.enable() replaced this with   ethereum.request({ method: 'eth_requestAccounts' }) => hinted by console> in chromeDevTools

    // Load account data NEW METHOD
    ethereum.request({ method: 'eth_requestAccounts' }).then(function (acc) {
      App.account = acc[0];
      $("#accountAddress").html("Your Account: " + App.account);
    });


    /*
    // Load contract data
    App.contracts.Election.deployed().then(function (instance) {
      electionInstance = instance;
      return electionInstance.candidatesCount();
    }).then(function (candidatesCount) {
      var candidatesResults = $("#candidatesResults");
      candidatesResults.empty();

      //adding candidateSelect script 
      var candidatesSelect = $('#candidatesSelect');
      candidatesSelect.empty();


      for (var i = 1; i <= candidatesCount; i++) {
        electionInstance.candidates(i).then(function (candidate) {
          var id = candidate[0];
          var name = candidate[1];
          var voteCount = candidate[2];

          // Render candidate Result
          var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
          candidatesResults.append(candidateTemplate);

          // Render candidate ballot option
          var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
          candidatesSelect.append(candidateOption);

        }); 

      }
      //hide the dropdown if already voted!
      return electionInstance.voters(App.account);
    }) */
    //Commented till above code is :repeated rows rendering ISSUE fixed by: https://stackoverflow.com/questions/56730883/how-to-prevent-duplicate-rows-from-being-displayed-in-html
    App.contracts.Election.deployed()
      .then(function (instance) {
        electionInstance = instance;
        return electionInstance.candidatesCount();
      })
      .then(function (candidatesCount) {
        const promises = [];
        // Store all prosed to get candidate info
        for (var i = 1; i <= candidatesCount; i++) {
          promises.push(electionInstance.candidates(i));
        }

        // Once all candidates are received, add to dom
        Promise.all(promises).then(candidates => {
          var candidatesResults = $("#candidatesResults");
          candidatesResults.empty();

          var candidatesSelect = $("#candidatesSelect");
          candidatesSelect.empty();

          candidates.forEach(candidate => {
            var id = candidate[0];
            var name = candidate[1];
            var voteCount = candidate[2];
            var partyName = candidate[3];

            // Render candidate Result
            var candidateTemplate =
              "<tr><th>" +
              id +
              "</th><td>" +
              name +
              "</td><td>" +
              partyName +
              "</td><td>" +
              voteCount +
              "</td></tr>";
            candidatesResults.append(candidateTemplate);

            // Render candidate ballot option
            var candidateOption =
              "<option value='" + id + "' >" + name + "  (" + partyName + ")" + " </ option> ";
            candidatesSelect.append(candidateOption);
          });
        });

        return electionInstance.voters(App.account);
      })
      .then(function (hasVoted) {
        // Do not allow a user to vote
        if (hasVoted) {
          $('form').hide();
          $('#vote-msg').html(`
        <div class="alert alert-danger text-center" role="alert">
          <span>You have already voted!</span>
      </div>`)

        }


        loader.hide();
        content.show();
      }).catch(function (error) {
        console.warn(error);
      });
  },
  castVote: function () {
    var candidateId = $('#candidatesSelect').val();
    App.contracts.Election.deployed().then(function (instance) {
      return instance.vote(candidateId, { from: App.account });
    }).then(function (result) {
      // Wait for votes to update
      $("#content").hide();
      $("#loader").show();
    }).catch(function (err) {
      console.error(err);
    });
  }
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});