//We can write tests in solidity but we'll do in JS to sinmulate client side interactions with our contracts!
//Truffle framework has MOcha(testing framework) and the Chai(assertion library).

var Election = artifacts.require("./Election.sol");

contract("Election", function (accounts) {      //I made a typo here i.e contracts instead of contract at (6,1)
    var electionInstance;
    it("intializes with 2 candidates", function () {
        return Election.deployed().then(function (instance) {
            return instance.candidatesCount();
        }).then(function (count) {
            assert.equal(count, 3);
        });
    });

    it("intializes candidates with the correct values", function () {
        return Election.deployed().then(function (instance) {
            electionInstance = instance;

            return electionInstance.candidates(1);
        }).then(function (candidate) {
            assert.equal(candidate[0], 1, "contains the correct id");
            assert.equal(candidate[1], "Joe Biden", "contains the correct name");
            assert.equal(candidate[2], 0, "contains the correct votes count");
            assert.equal(candidate[3], "Democratic Party", "contains the correct partyName");
            return electionInstance.candidates(2);
        }).then(function (candidate) {
            assert.equal(candidate[0], 2, "contains the correct id");
            assert.equal(candidate[1], "Donald Trump", "contains the correct name");
            assert.equal(candidate[2], 0, "contains the correct votes count");
            assert.equal(candidate[3], "Republican Party", "contains the correct partyName");
            return electionInstance.candidates(3);
        }).then(function (candidate) {
            assert.equal(candidate[0], 3, "contains the correct id");
            assert.equal(candidate[1], "Kanye West", "contains the correct name");
            assert.equal(candidate[2], 0, "contains the correct votes count");
            assert.equal(candidate[3], "Independent Candidate", "contains the correct partyName");
        });
    });
    // 2 tasks: voteCount increased and voter registers in VotedList!
    it("allows a voter to cast a vote", function () {
        return Election.deployed().then(function (instance) {
            electionInstance = instance;
            candidateId = 1;
            return electionInstance.vote(candidateId, { from: accounts[0] });
        }).then(function (receipt) {
            /*
            This test inspects the transaction receipt returned by the "vote" function to ensure that it has logs.
            These logs contain the event that was triggered. 
            We check that the event is the correct type, and that it has the correct candidate id.
            */
            assert.equal(receipt.logs.length, 1, "an event was triggered");
            assert.equal(receipt.logs[0].event, "votedEvent", "the event type is correct");
            assert.equal(receipt.logs[0].args._candidateID.toNumber(), candidateId, "the candidate id is correct"); //LHS has _candidateID ->coz its form .sol & RHS is a local JS var so candidateId.
            return electionInstance.voters(accounts[0]);
        }).then(function (voted) {
            assert(voted, "the voter was marked as voted");
            return electionInstance.candidates(candidateId);
        }).then(function (candidate) {
            var voteCount = candidate[2];
            assert.equal(candidate[2], 1, "increaments the candidate's vote count ");
        })
    });

    it("throws an exception for invalid candidates", function () {
        return Election.deployed().then(function (instance) {
            electionInstance = instance;
            return electionInstance.vote(99, { from: accounts[1] })
        }).then(assert.fail).catch(function (error) {
            assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
            return electionInstance.candidates(1);
        }).then(function (candidate1) {
            var voteCount = candidate1[2];
            assert.equal(voteCount, 1, "candidate 1 did not receive any votes");
            return electionInstance.candidates(2);
        }).then(function (candidate2) {
            var voteCount = candidate2[2];
            assert.equal(voteCount, 0, "candidate 2 did not receive any votes");
        });
    });

    it("throws an exception for double voting", function () {
        return Election.deployed().then(function (instance) {
            electionInstance = instance;
            candidateId = 2;
            electionInstance.vote(candidateId, { from: accounts[1] });
            return electionInstance.candidates(candidateId);
        }).then(function (candidate) {
            var voteCount = candidate[2];
            assert.equal(voteCount, 1, "accepts first vote");
            // Try to vote again

            return electionInstance.vote(candidateId, { from: accounts[1] });
        }).then(assert.fail).catch(function (error) {
            assert(error.message.indexOf('revert') >= 0, "error message must contain revert");  //my test not passing in this IDK why this is happening!
            return electionInstance.candidates(1);
        }).then(function (candidate1) {
            var voteCount = candidate1[2];
            assert.equal(voteCount, 1, "candidate 1 did not receive any votes");
            return electionInstance.candidates(2);
        }).then(function (candidate2) {
            var voteCount = candidate2[2];
            assert.equal(voteCount, 1, "candidate 2 did not receive any votes");
        });
    });


});