<?php

// $connection = new MongoClient();
//echo '<pre>';print_r($_REQUEST['activity_type']);exit;
 // echo json_encode ( array (
	//                 'status' => 'success',
	//                 'detail' => $_REQUEST['activity_type']
	//             ) );die();
$connections = new MongoClient("mongodb://localhost:27017/vantage_api");
$db = $connections->selectDB("vantage_api");
$collection = new MongoCollection($db, 'events');
if (isset($_REQUEST['action']) && $_REQUEST['action'] =='add_offer') {
	$newarra = array();
	if (isset($_REQUEST['activity_type']) && !empty($_REQUEST['activity_type'])) {
		foreach ($_REQUEST['activity_type'] as $key => $value) {
			if ($value && $value !='') {
				$newarra[$value]['offer_value'] = $_REQUEST['offer_value'][$key];
				$newarra[$value]['dress_code'] = $_REQUEST['dress_code'][$key];
				$newarra[$value]['details'] = $_REQUEST['details'][$key];
				$newarra[$value]['start_time'] = $_REQUEST['start_time'][$key];
				$newarra[$value]['end_time'] = $_REQUEST['end_time'][$key];
			}
		}
	}
	$curdate=strtotime($_REQUEST['start_date']);
	$start = new MongoDate(strtotime($_REQUEST['start_date']));
	$datetime1 = date_create($_REQUEST['start_date']);
	$date1 = new DateTime("now");
	$created_date = new MongoDate();
	if(strtotime($_REQUEST['start_date']) >= strtotime(date("Y-m-d")))
	{
	   	$interval = date_diff($date1, $datetime1);
	   	$total_hrs = ($interval->days*24)+$interval->h;
		if ($total_hrs <=24) {
			$status = 'AVAILABLE';
		}else{
			$status = 'AVAILABLE SOON';
		}
		if (isset($_REQUEST['business_id']) && $_REQUEST['business_id'] !='' && isset($_REQUEST['start_date']) && $_REQUEST['start_date'] !='') {
			if (!empty($newarra)) {
				$activities = json_encode($newarra);	
			}else{
				$activities = '';
			}
			$data = array('business_id' => $_REQUEST['business_id'], 'name' => $_REQUEST['name'],'venue_id'=>$_REQUEST['venue_id'],'start_date' => $start, 'type' => 'offer','distance'=>0,'lat'=>0,'lng'=>0,'reservation_count'=>0,'checkins_count'=>0,'status'=>$status,'activity_type'=>$activities,'spots'=>$_REQUEST['spots'],'category'=>$_REQUEST['category'],'created_date'=>$created_date);
			try {
				 $target_dir = "../uploads/events/";
				 $target_file = $target_dir . basename($_FILES["offer_image"]["name"]);
				 if (move_uploaded_file($_FILES["offer_image"]["tmp_name"], $target_file)) {
			        $path = 'http://work4brands.com:4200/files/events/'.basename( $_FILES["offer_image"]["name"]);
			     } else {
			        $path = '';
			     }
			     $data['image'] = $path;
			     $collection->insert($data);
			     $fieldid = '$id';
			     $data['offer_id'] = $data['_id']->$fieldid;
			     if ($_REQUEST['add_from_admin']) {
			     	header('Location:http://work4brands.com:4200/admin/offers?add=1');die();	
			     }
			     echo json_encode ( array (
		                'status' => 'success',
		                'detail' => $data
		            ) );
			} catch(MongoCursorException $e) {
			    echo json_encode ( array (
		                'status' => 'failed'
		            ) );
			}
		}else{
			echo json_encode ( array (
		                'status' => 'failed',
		                'detail' => 'enter buisness id and name!'
		            ) );
		} 
	}else{
		echo json_encode ( array (
		                'status' => 'failed',
		                'detail' => 'Please Select Start Date Greater than Current Date!'
		            ) );
	}
	
	
}

if (isset($_REQUEST['action']) && $_REQUEST['action'] =='add_offer_activities') {
	$postdata = file_get_contents("php://input");
	$data = json_decode($postdata, true);
	// foreach ($data['activity_type'] as $key => $value) {
	// 		if ($value && $value !='') {
	// 			$newarra[$value]['offer_value'] = $data['activity_type'][$key]['offer_value'];
	// 			$newarra[$value]['dress_code'] = $_REQUEST['dress_code'][$key];
	// 			$newarra[$value]['details'] = $_REQUEST['details'][$key];
	// 			$newarra[$value]['start_time'] = $_REQUEST['start_time'][$key];
	// 			$newarra[$value]['end_time'] = $_REQUEST['end_time'][$key];
	// 		}
	// }
	if (!$data['activity_type'] && !isset($data['activity_type'])) {
		$data['activity_type'] = '';
	}
	$newdata = array('$set' => array("activity_type" => json_encode($data['activity_type'])));
	// echo json_encode(array("activity_type" => $data['activity_type']));exit;
	$collection->update(array("_id" => new MongoId($data['id'])), $newdata);
	$item = $collection->findOne(array('_id' => new MongoId($data['id'])));
	echo json_encode ( array (
	                'status' => 'success',
	                'detail' => $item
	) );
}




