<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

class Category {
   
    function getCategories($json){
        include 'conn.php';
        $json = json_decode($json, true);


        $sql = "SELECT a.`category_id`, a.`category_name`, a.`type_id`, b.type_name FROM 
	                `tbl_category` a JOIN tbl_transaction_type b ON a.type_id = b.type_id";

        $stmt = $conn->prepare($sql);
        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);

        unset($conn);
        unset($stmt);
        return json_encode($returnValue);
    }

    function getTypes($json){
        include 'conn.php';
        $json = json_decode($json, true);
        $sql = "SELECT `type_id`, `type_name` FROM `tbl_transaction_type`";
        $stmt = $conn->prepare($sql);
        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);

        unset($conn);
        unset($stmt);
        return json_encode($returnValue);
    }

     function addCategory($json){
        include 'conn.php';

        $json = json_decode($json, true);



        $sql = "INSERT INTO `tbl_category`(`category_name`, `type_id`) VALUES (:category_name, :type_id)";

        $stmt = $conn->prepare($sql);

        $stmt->bindValue(':category_name', $json['Category_name']);
        $stmt->bindValue(':type_id', $json['Type_id']);
       

        try {
            $stmt->execute();
            $returnValue = 'Success';
        } catch (PDOException $e) {
            $returnValue = 'Error: ' . $e->getMessage();
        }

        unset($stmt);
        unset($conn);

        return json_encode($returnValue);
    }

}

// submitted by the client - operation and json data
if ($_SERVER['REQUEST_METHOD'] == 'GET'){
    $operation = $_GET['operation'];
    $json = $_GET['json'];
} else if ($_SERVER['REQUEST_METHOD'] == 'POST'){
    $operation = $_POST['operation'];
    $json = $_POST['json'];
}

$category = new Category();
switch($operation){
    case 'getCategory':
        echo $category->getCategories($json);
        break;
    case 'getTypes':
        echo $category->getTypes($json);
        break;
    case 'addCategory':
        echo $category->addCategory($json);
        break;
  
}
?>


