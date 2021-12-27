pragma solidity 0.5.16;

contract Election {
    //Read or Write Candidate Name in a state variable (State varibales allow us to write data to blockchian!)

    //model a candidate
    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
        string partyName;
    }
    // To store accounts that VOTED!
    mapping(address => bool) public voters;
    // store a candidate
    mapping(uint256 => Candidate) public candidates;
    // fetch a candidate
    // store candidate count
    uint256 public candidatesCount;

    //trigger an event whenever a vote is cast!
    event votedEvent(uint256 indexed _candidateID);

    //Declaring a constructor
    constructor() public {
        addCandidate("Joe Biden", "Democratic Party");
        addCandidate("Donald Trump", "Republican Party");
        addCandidate("Kanye West", "Independent Candidate");
    }

    function addCandidate(string memory _name, string memory _partyName)
        private
    {
        // here _name is a local variable(starts with '_') and we keep it private as only admins add new candidate!
        candidatesCount++;
        candidates[candidatesCount] = Candidate(
            candidatesCount,
            _name,
            0,
            _partyName
        ); //0 means zero Vote counts!
    }

    //Logic For ELECTION-VOTING
    function vote(uint256 _candidateID) public {
        //record that the voter has voted this candidate once (to prevent voting twice or more)
        //require that they haven't voted before
        require(!voters[msg.sender]);

        //for a valid candidate to get voted
        require(_candidateID > 0 && _candidateID <= candidatesCount);

        // Solution: Solidity allows to pass metaData to a fn. beyond its parameters and this can be used to track above voter.
        //truffle console> app.vote(1,{from accounts[0]})
        voters[msg.sender] = true;

        //core function is to increase the votecount of the candidate
        candidates[_candidateID].voteCount++;

        // trigger voted event
        emit votedEvent(_candidateID); //TypeError: Event invocations have to be prefixed by "emit".
    }
}
