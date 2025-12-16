<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

class Transaction {
   
    function addTransaction($json){
        include 'conn.php';

        $json = json_decode($json, true);



        $sql = "INSERT INTO `tbl_transaction`(`ammount`, `description`, `date`, `category_id`) 
             VALUES (:amount, :description, :date, :category_id)";

        $stmt = $conn->prepare($sql);

        $stmt->bindValue(':amount', $json['Amount']);
        $stmt->bindValue(':description', $json['Description']);
        $stmt->bindValue(':date', $json['Date']);
        $stmt->bindValue(':category_id', $json['Category_id']);

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

      function getTransaction($json){
        include 'conn.php';
        $json = json_decode($json, true);


        $sql = "SELECT a.`transaction_id`, a.`ammount`, a.`description`, a.`date`, a.`category_id`, b.category_name, c.type_name 
	            FROM `tbl_transaction` a 
                JOIN tbl_category b ON a.category_id = b.category_id
                JOIN tbl_transaction_type c ON b.type_id = c.type_id
                ORDER BY a.transaction_id DESC";

        $stmt = $conn->prepare($sql);
        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);

        unset($conn);
        unset($stmt);
        return json_encode($returnValue);
    }

      function getTransactionByID($json){
        include 'conn.php';
        $json = json_decode($json, true);


        $sql = "SELECT a.`transaction_id`, a.`ammount`, a.`description`, a.`date`, a.`category_id`, b.category_name, c.type_name 
	            FROM `tbl_transaction` a 
                JOIN tbl_category b ON a.category_id = b.category_id
                JOIN tbl_transaction_type c ON b.type_id = c.type_id
                WHERE a.transaction_id = :transaction_id
                ORDER BY a.date DESC";

        $stmt = $conn->prepare($sql);
        $stmt->bindValue(':transaction_id', $json['Transaction_id']);
        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);

        unset($conn);
        unset($stmt);
        return json_encode($returnValue);
    }

    function deleteTransaction($json){
        include 'conn.php';

        $json = json_decode($json, true);
    
        $sql = "DELETE FROM `tbl_transaction` WHERE transaction_id = :transaction_id";  
        $stmt = $conn->prepare($sql);
        $stmt->bindValue(':transaction_id', $json['Transaction_id']);
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

    function editTransaction($json){
        include 'conn.php';

        $json = json_decode($json, true);

        $sql = "UPDATE `tbl_transaction` 
            SET `ammount`=:amount,`description`=:description,`date`=:date,`category_id`=:category_id WHERE `transaction_id`=:transaction_id";

        $stmt = $conn->prepare($sql);

        $stmt->bindValue(':amount', $json['Amount']);
        $stmt->bindValue(':description', $json['Description']);
        $stmt->bindValue(':date', $json['Date']);
        $stmt->bindValue(':category_id', $json['Category_id']);
        $stmt->bindValue(':transaction_id', $json['Transaction_id']);

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

$transaction = new Transaction();
switch($operation){
    case 'addTransaction':
        echo $transaction->addTransaction($json);
        break;
    case 'getTransaction':
        echo $transaction->getTransaction($json);
        break;
    case 'getTransactionByID':
        echo $transaction->getTransactionByID($json);
        break;
    case 'deleteTransaction':
        echo $transaction->deleteTransaction($json);       
        break;
    case 'editTransaction':
        echo $transaction->editTransaction($json);
        break;
  
}
?>


