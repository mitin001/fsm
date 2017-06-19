'use strict';

const getIvan = evan => {
  let ivan;
  let nodes, links; // evan properties
  let states = [], initial = 0, accepting = [], alphabet = [], transitions = []; // ivan properties
  let aliases = { states: {}, characters: {} }; // conversion hashes

  const globalAlphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
  const parseNode = (node, index) => {
    if (node.isAcceptState) accepting.push(index);
    states.push(index);
    aliases.states[index] = node.text;
  }
  const parseLink = (link, index) => {
    let character = globalAlphabet[index];
    alphabet.push(character);
    aliases.characters[character] = link.text;
    switch (link.type) {
      case 'Link':
        transitions.push(`${link.nodeA}:${character}>${link.nodeB}`);
        break;
      case 'SelfLink':
        transitions.push(`${link.node}:${character}>${link.node}`);
        break;
    }
  };

  nodes = evan.nodes;
  links = evan.links;
  if (nodes && Array.isArray(nodes)) nodes.forEach(parseNode);
  if (links && Array.isArray(links)) links.forEach(parseLink);

  ivan = [].concat(
    ['#states'], states,
    ['#initial'], [initial],
    ['#accepting'], accepting,
    ['#alphabet'], alphabet,
    ['#transitions'], transitions
  ).join('\n');

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

const getEvan = () => {}; // TODO: get from Evan frontend
const getRegex = ivan => {}; // TODO: integrate with Ivan backend

let evan = getEvan();
let ivanWithAliases = getIvan(evan);
let textbookRegex = getRegex(ivanWithAliases.ivan);
let regex = decompressRegex(textbookRegex, ivanWithAliases.aliases.characters);

