import test from 'node:test';
import assert from 'node:assert/strict';
import { defaults, validateDesign, designQuery, restoreDesign, summary } from '../assets/state.js';
test('malformed and unknown inputs safely use defaults',()=>{
  for(const input of [null,undefined,'oops',[],{wall:'<script>',width:Infinity,length:-3,pattern:'unknown'}])assert.deepEqual(validateDesign(input),defaults);
  assert.equal(validateDesign({width:8.56}).width,8.6);
});
test('share query round-trips all choices and contains no personal data',()=>{
  const design={wall:'sage',furniture:'olive',floor:'walnut',pattern:'chevron',finish:'satin',width:6.3,length:3.2};
  const query=designQuery({...design,email:'private@example.com'});
  assert.deepEqual(restoreDesign('?'+query,null),design);assert.ok(!query.includes('email'));
  assert.ok(summary(design).includes('20.2 m²'));
});
test('URL overrides storage and validates each value independently',()=>{
  assert.deepEqual(restoreDesign('?floor=unknown&width=100',{...defaults,wall:'sage'}),defaults);
  assert.equal(restoreDesign('',{...defaults,wall:'sage'}).wall,'sage');
  assert.equal(restoreDesign('?floor=light',{...defaults,wall:'sage'}).floor,'light');
});
