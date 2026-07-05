/* Uber Eats 配達範囲一括設定 — 汎用ロジック（店舗情報は window.__UE から受け取る。機密情報なし） */
(function(){
  var S=window.__UE; if(!S||!S.length){alert('店舗データがありません');return;}
  var HOME='https://merchants.ubereats.com/manager/settings/delivery?restaurantUUID='+S[0][1];
  function run(km){
    var mr=km/1.609344, H={'content-type':'application/json','x-csrf-token':'x'};
    var U='/manager/api/updateDeliverySettings?localeCode=ja-JP';
    var ok=[],ng=[],i=0;
    (function go(){
      if(i>=S.length){alert((ng.length?'⚠ 失敗: '+ng.join('、')+'\n':'')+'✅ 完了 ('+km+'km)\n'+ok.join('、'));location.reload();return;}
      var s=S[i++];
      var b1={operationName:'createByocFulfillmentConfig',variables:{fulfillmentConfig:{merchantUuid:s[1],enabled:true,fulfillmentInfoList:[{polygonUuid:s[2],deliveryZoneType:'DELIVERY_ZONE_TYPE_RADIUS',deliveryZoneMetadataInfo:[{minRadius:0,maxRadius:mr,deliveryFeeInfo:{deliveryFee:{amountE5:'100000000',currencyCode:'JPY'}},etdInfo:{deliveryEtd:'25'},postalCodeList:[]}]}]}},query:'mutation createByocFulfillmentConfig($fulfillmentConfig: CreateByocFulfillmentConfigInput!){createByocFulfillmentConfig(fulfillmentConfig: $fulfillmentConfig)}'};
      var ud=function(dis){return{restaurantUUID:s[1],deliverySettings:{ueoZoneToggledEnabled:false,thirdPartyFreeShapeDeliveryZoneInfo:{hexagonIDs:[],multipleGeofence:[{polygonUUID:s[2],polygonName:'Radial Zone',geofence:[],hexagonIDs:[],deliveryRadius:mr,deliveryZoneType:'RADIUS',geofenceUUID:null,multiPolygon:[],geofenceType:'Polygon',isDisabled:dis}]}}};};
      fetch('/manager/graphql?op=createByocFulfillmentConfig',{method:'POST',credentials:'include',headers:H,body:JSON.stringify(b1)})
        .then(function(){return fetch(U,{method:'POST',credentials:'include',headers:H,body:JSON.stringify(ud(true))});})
        .then(function(){return fetch(U,{method:'POST',credentials:'include',headers:H,body:JSON.stringify(ud(false))});})
        .then(function(x){return x.text();})
        .then(function(t){(t.indexOf('"status":"success"')>=0?ok:ng).push(s[0]);go();})
        .catch(function(){ng.push(s[0]);go();});
    })();
  }
  if(location.host.indexOf('merchants.ubereats.com')>=0){
    var hk=(location.hash.match(/ue=([0-9.]+)/)||[])[1];
    if(hk){try{history.replaceState(null,'',location.pathname+location.search);}catch(e){location.hash='';}}
    var km; if(hk){km=parseFloat(hk);} else {var r=prompt('配達範囲 最大距離(km)を入力',localStorage.getItem('ueKm')||'2.0'); if(r===null)return; km=parseFloat(r); if(km>0)localStorage.setItem('ueKm',r);}
    if(!(km>0)){alert('正しい数値を入力してください');return;}
    run(km);
  } else {
    var r2=prompt('配達範囲 最大距離(km)を入力\n→OKでUberを開きます。開いたらもう一度押してください','2.0');
    if(r2===null)return; var km2=parseFloat(r2); if(!(km2>0)){alert('正しい数値を入力してください');return;}
    location.href=HOME+String.fromCharCode(35)+'ue='+km2;
  }
})();
