/***************************************************************************
 * 
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
 * $Id$ 
 * 
 **************************************************************************/
 
 
 
/**
 * index.spec.js ~ 2014/03/04 18:28:04
 * @author leeight(liyubei@baidu.com)
 * @version $Revision$ 
 * @description 
 *  
 **/
var index = require( '../index' );

describe('index', function(){
    it('default', function(){
        expect( index.getMaxSize({}) ).toBe( 10 * 1024 * 1024 );

        expect( index.getMaxSize({ 'max-size': '2M' }) ).toBe( 2 * 1024 * 1024 );
        expect( index.getMaxSize({ 'max-size': '2m' }) ).toBe( 2 * 1024 * 1024 );

        expect( index.getMaxSize({ 'max-size': '2K' }) ).toBe( 2 * 1024 );
        expect( index.getMaxSize({ 'max-size': '2k' }) ).toBe( 2 * 1024 );

        expect( index.getMaxSize({ 'max-size': '2.1K' }) ).toBe( 2 * 1024 );
        expect( index.getMaxSize({ 'max-size': '2.1k' }) ).toBe( 2 * 1024 );
    });
});





















/* vim: set ts=4 sw=4 sts=4 tw=100: */
