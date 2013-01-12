$(function(){
  /***************parems*********************/
	var map = new BMap.Map("l-map",{minZoom:5,maxZoom:18});
	map.enableScrollWheelZoom();    
	map.centerAndZoom("银川", 5);
	map.addControl(new BMap.NavigationControl()); 
	
	var index = 0;
	var myValue;
	var polyline;
	var marker;
	var polylines = [];
	var function_polylines=function(polyline){
	    polylines.push(polyline);
	};
	
	var myGeo = new BMap.Geocoder();
	var myGeosec = new BMap.Geocoder();
	var myGeodis = new BMap.Geocoder();
	
	var xmlhttp;
	var xmlsource="address.xml";//xml位置
	//var xmlsource = "";
	var adds = [];
	
	/*****************loadxml*******************/
	function loadXMLDoc(url){
        xmlhttp=null;
        if (window.XMLHttpRequest){
          xmlhttp=new XMLHttpRequest(); // code for IE7, Firefox, Opera, etc.
        }else if (window.ActiveXObject){
          xmlhttp=new ActiveXObject("Microsoft.XMLHTTP"); // code for IE6, IE5
        }
        if (xmlhttp!=null){
          xmlhttp.onreadystatechange=state_Change;
          xmlhttp.open("GET",url,true);
          xmlhttp.send(null);
        }else{
          alert("你的浏览器不支持XMLHTTP,建议使用IE, Firefox, Opera。");
        }
    }
    
    function state_Change(){
        if (xmlhttp.readyState==4){
          if (xmlhttp.status==200){
        	 var codearray=[];     // 代码
			 var telarray=[];      // 电话
			 var addrarray=[];     // 地址
			 var coorinatearray=[];// 坐标
             var xml = xmlhttp.responseXML;
             var branch_nodes=xml.getElementsByTagName("branch");//获取每个结点branch
             for(var q=0;q<branch_nodes.length;q++){
                var addr=branch_nodes[q].getElementsByTagName("branch_address")[0].childNodes;
                if(addr.length!=0){
                    var tel=branch_nodes[q].getElementsByTagName("branch_tel")[0].childNodes;
                    codearray.push(branch_nodes[q].getElementsByTagName("branch_code")[0].firstChild.nodeValue);
                    coorinatearray.push(branch_nodes[q].getElementsByTagName("branch_coordinate")[0].firstChild.nodeValue);
                    addrarray.push(addr[0].nodeValue);
                    if(tel.length!=0){
                        telarray.push(tel[0].nodeValue);
                    }else{
                        telarray.push("");
                    }
                }
             }
	          adds.push(codearray);
	          adds.push(telarray);
	          adds.push(addrarray);
	          adds.push(coorinatearray);
	          bdGEO();
          }else{
            alert("Problem retrieving XML data:" + xmlhttp.statusText);
          }
        }
   	}

	/************map display***************/
	function bdGEO(){
	    var add = adds[3][index];
	    geocodeSearch(add);
	    index++;
	}
	function geocodeSearch(add){
	    if(index < adds[0].length){
	        setTimeout(bdGEO,50);
	    } 
	    /*myGeo.getPoint(add.substring(3), function(point){
	      if (point) {
	        document.getElementById("result").innerHTML +=  index + "、" + add + ":" + point.lng + "," + point.lat + "</br>";
	        var marker = new BMap.Marker(new BMap.Point(point.lng, point.lat));
	        map.addOverlay(marker);
	        var label = new BMap.Label(add);
	        marker.setLabel(label);
	      }
	    }, add.substring(0,3));*/
	    var addpoint = add.split(",");
	    var marker = new BMap.Marker(new BMap.Point(addpoint[0], addpoint[1]));
	    map.addOverlay(marker);
	    var label = new BMap.Label(adds[2][index]);
	    marker.setLabel(label);
	}
	
	function check(){
	    var addstext = $("#suggestId").val();
	    myGeosec.getPoint(addstext, function(point){
	        if(point){
	            map.removeOverlay(marker);
	            marker = new BMap.Marker(new BMap.Point(point.lng, point.lat));
	            map.addOverlay(marker);
	            marker.setAnimation(BMAP_ANIMATION_BOUNCE);
	            for(var pi = 0;pi<polylines.length;pi++){
	                map.removeOverlay(polylines[pi]);
	            }
	          
	            address_point(point);
	            $("#addcomp_span").remove();
	            myGeodis.getLocation(point, function(rs){
	                var addComp = rs.addressComponents;
	                $("#addcomp").append("<span id='addcomp_span'>"+addComp.province+"-"+addComp.city+"-"+addComp.district+"</span>");
	            });
	        }else{
	            alert("查询失败!地址输入可能过于简单!请重新输入更详细地址！");
	        }
	    },"全国");
	}
	
	function address_point(point){
	    var distance_short = [];
	    var distance_num = [];
	    var distance_short_bac = [];
	    var text_point = "";
	    var dot_point = "";
	    var distance = "";
	
	    
	    map.removeOverlay(polyline);
	    for(var j=0;j<adds[3].length;j++)
	    {   
	        var site_point = adds[3][j].split(",");
	        text_point = new BMap.Point(point.lng, point.lat);  // 创建点坐标
	        dot_point = new BMap.Point(site_point[0] ,site_point[1]);
	
	        distance = map.getDistance(text_point, dot_point);
	        distance_num.push(j);
	        distance_short.push(distance);
	        distance_short_bac.push(distance);
	        polyline = new BMap.Polyline([text_point,dot_point], {strokeColor:"blue", strokeWeight:6, strokeOpacity:0.5});  //定义折线
	        function_polylines(polyline);
	        map.addOverlay(polyline);
	    }
	    distance_short = distance_short.sort(function(a,b){
	        return a-b;
	    });
	    $("#address_result tbody tr").remove();
	    $.each(distance_short,function(k,num){
	         
	         $.each(distance_short_bac,function(n,bacnum){
	            if (bacnum==num) {
	                $("#address_result").append("<tr id='distance_tr'><td id='distance_code'>"+adds[0][n]+"</td><td id='distance_phone'>"+adds[1][n]+"</td><td id='distance_add'>"+adds[2][n]+"</td><td id='distance_text'>"+Math.round(distance_short[k])+"</td></tr>");
	
	            }
	        });
	
	    });
	}
	
	/*****************begin******************/
	loadXMLDoc(xmlsource);
	$("#checkbutton").click(function(){
		check();
	});
});
