import test from 'node:test';
import assert from 'node:assert/strict';
import {asBoolean,asInt,asNumber,isJavaObject,local,popInt,popValue,pushValue,setLocal} from '../dist/runtime-values.js';

test('Java object guard accepts VM objects only',()=>{assert.equal(isJavaObject({javaClass:'f',fields:{}}),true);assert.equal(isJavaObject({fields:{}}),false);assert.equal(isJavaObject(null),false)});
test('numeric bridge handles number bigint and fallback',()=>{assert.equal(asNumber(12.5),12.5);assert.equal(asNumber(12n),12);assert.equal(asNumber(null,7),7)});
test('integer bridge follows JVM 32-bit coercion',()=>{assert.equal(asInt(3.9),3);assert.equal(asInt(0xffffffff),-1)});
test('boolean bridge follows JVM zero semantics',()=>{assert.equal(asBoolean(0),false);assert.equal(asBoolean(-1),true)});
test('typed operand helpers preserve stack order',()=>{const f={owner:'x',method:{name:'m',desc:'()V',access:0,code:[]},code:[],locals:[],stack:[],pc:0,lastPC:0};pushValue(f,3);pushValue(f,9);assert.equal(popInt(f),9);assert.equal(popValue(f),3)});
test('typed local helpers preserve null default',()=>{const f={owner:'x',method:{name:'m',desc:'()V',access:0,code:[]},code:[],locals:[],stack:[],pc:0,lastPC:0};assert.equal(local(f,2),null);setLocal(f,2,44);assert.equal(local(f,2),44)});
