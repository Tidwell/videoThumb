var log = require('logging');
var terms = [
  {
    _id:  'TE001',
    term: 'meat'
  },
  {
    _id:  'TE002',
    term: 'chicken'
  },
  {
    _id:  'TE003',
    term: 'beef'
  },
  {
    _id:  'TE004',
    term: 'free-range chicken'
  },
  {
    _id:  'TE005',
    term: 'fruit&vegies'
  },
  {
    _id:  'TE006',
    term: 'tomato'
  },
  {
    _id:  'TE007',
    term: 'carrots'
  },
  {
    _id:  'TE008',
    term: 'baby carrots'
  },
  {
    _id:  'TE009',
    term: 'food'
  },
  {
    _id:  'TE010',
    term: 'tofu (as fruit)'
  },
  {
    _id:  'TE011',
    term: 'tofu (as meat)'
  }
]

var taxonomy = [
 //meat
 {
  _id: 'TA001',
  term_id: 'TE001',
  children: [{id:'TA002',type:'taxonomy'}, {id:'TE011',type:'term'}, {id:'TE003',type:'term'}],
 },
 //chicken
 {
  _id: 'TA002',
  term_id: 'TE002',
  children: [{id:'TE004',type:'term'}]
 },
 //fruit&vegies
 {
  _id: 'TA004',
  term_id: 'TE005',
  children: [{id:'TE006',type:'term'}, {id:'TE010',type:'term'}, {id:'TA005',type:'taxonomy'}],
 },
 //carrots
 {
  _id: 'TA005',
  term_id: 'TE007',
  children: [{id:'TE008',type:'term'}],
 },
 //food
 {
  _id: 'TA006',
  term_id: 'TE009',
  children: [{id:'TA001',type:'taxonomy'}, {id:'TA004',type:'taxonomy'}],
  root: true
 } 
]



var articles = [
  {
    _id: 'A001',
    parent_tax_id: 'TA002',
    term_id: 'TE004' 
  }
]


var rootObj = {
  _id: 'TA006',
  term_id: 'TE009',
  children: [{id:'TA001',type:'taxonomy'}, {id:'TA004',type:'taxonomy'}],
  root: true
 };


/*
{
  meat: [
    {
      chicken: [
        {free-range chicken: []}
      ],
      beef: []
    } 
  ]
}
*/

var terms_to_hash = function(terms) {
  var hash = {};
  terms.forEach(function(term) {
    hash[term._id] = term.term
  });
  return hash;
}
var taxon_to_hash = function(terms) {
  var hash = {};
  taxonomy.forEach(function(tax) {
    hash[tax._id] = tax
  });
  return hash;
}


var generateCompleteTaxonomyTree = function(rootObj, taxonomy, terms) {
  //get the terms/taxon in an easier to use format
  var terms = terms_to_hash(terms);
  var taxon = taxon_to_hash(taxonomy);

  var recursiveBuildTree = function(child) {
    //create the tree object that will hold this portion of the tree
    var treePart = {}
    //every term contains either an empty array or an array of objects, we init this array
    treePart[terms[child.term_id]] = [];
    //if the item passed in has children, we need to get those children's information
    if (child.children) {
      //for each of those kids
      child.children.forEach(function(grandchild) {
        //if its just a term (not another taxon) we add to the array an object containing the term as a key
        if (grandchild.type == 'term') {
          var newObj = {}
          newObj[terms[grandchild.id]] = []
          newObj.parentId = child._id
          treePart[terms[child.term_id]].push(newObj);
        }
        //otherwise we need to recursively build the tree
        else if (grandchild.type=='taxonomy'){
         var childTaxonomy = taxon[grandchild.id];
         var newObj = {};
         newObj.parentId = child._id
         treePart[terms[child.term_id]].push(recursiveBuildTree(childTaxonomy));
        }
      });
    }
    return treePart;
  }
  
  return recursiveBuildTree(rootObj);
}


var getParentTaxonomy = function(parentTaxId, terms, taxonomy) {
  var taxonomy = taxon_to_hash(taxonomy);
  var terms = terms_to_hash(terms);
  return taxonomy[parentTaxId];
}


var getAllParents = function(parentTaxId, terms, taxonomy) {
  var parents = [];
  var parent = getParentTaxonomy(parentTaxId, terms, taxonomy);
  log(parent);
  if (parent) {
    parents.push(parent);
    if (parent.root != true) {
      return parents.push(getAllParents(parents[parents.length-1].parentId, terms, taxonomy))
    }
  }
  else {
    return parents;
  }
  
}


log(generateCompleteTaxonomyTree(rootObj, taxonomy, terms))
log(getParentTaxonomy(articles[0].parent_tax_id, terms, taxonomy))
//log(getAllParents(articles[0].parent_tax_id, terms, taxonomy))