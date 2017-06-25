'use strict';

const noam = require('./noam');
const fsm = noam.fsm;
const re = noam.re;
const tree = re.tree;

const stringify = num => num.toString ? num.toString() : num;

const getIvan = evan => {
  let ivan;
  let nodes, links; // evan properties
  let states = [], initialState = '0', acceptingStates = [], alphabet = [], transitions = []; // ivan properties
  let aliases = { states: {}, symbols: {} }; // conversion hashes

  const globalAlphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
  const parseNode = (node, index) => {
    index = stringify(index);
    if (node.isAcceptState) acceptingStates.unshift(index);
    states.unshift(index);
    aliases.states[index] = node.text;
  }
  const parseLink = (link, index) => {
    let fromState, toStates;
    let symbol = globalAlphabet[stringify(index)];
    alphabet.unshift(symbol);
    aliases.symbols[symbol] = link.text;
    switch (link.type) {
      case 'Link':
        fromState = stringify(link.nodeA);
        toStates = [stringify(link.nodeB)];
        break;
      case 'SelfLink':
        let node = stringify(link.node);
        fromState = node;
        toStates = [node];
        break;
    }
    transitions.push({ fromState, toStates, symbol });
  };

  nodes = evan.nodes;
  links = evan.links;
  if (nodes && Array.isArray(nodes)) nodes.forEach(parseNode);
  if (links && Array.isArray(links)) links.forEach(parseLink);

  ivan = {states, alphabet, acceptingStates, initialState, transitions};

  return {ivan, aliases};
};

const decompressRegex = (regex, characters) => {
  const convertCharacter = character => {
    let result;
    if (result = characters[character]) return result;
    switch (character) {
      case '+': return '|';
      case '(': return '(?:'; // non-capturing group
    }
    return character;
  };
  return regex.split('').map(convertCharacter).join('');
};

const getEvan = () => (); // TODO: get from Evan frontend
const getRegex = ivan => {
  let regex = fsm.toRegex(ivan);
  let simplifiedRegex = tree.simplify(regex);
  return tree.toString(simplifiedRegex);
};

let evan = getEvan();
let ivanWithAliases = getIvan(evan);
let textbookRegex = getRegex(ivanWithAliases.ivan);
let regex = decompressRegex(textbookRegex, ivanWithAliases.aliases.symbols);
