<?php
/**
 * AdminGuruku - Integrasi API Notifikasi WhatsApp Gateway
 */
function kirim_notifikasi_wa($no_tujuan, $isi_pesan) {
    $no_tujuan = preg_replace('/[^0-9]/', '', $no_tujuan);
    if (substr($no_tujuan, 0, 1) === '0') {
        $no_tujuan = '62' . substr($no_tujuan, 1);
    }

    $api_url = "https://api.fonnte.com/send"; 
    $token   = "YOUR_API_TOKEN_HERE"; // Ganti dengan Token Fonnte Anda

    $curl = curl_init();
    curl_setopt_array($curl, array(
        CURLOPT_URL => $api_url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => "",
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => "POST",
        CURLOPT_POSTFIELDS => array('target' => $no_tujuan, 'message' => $isi_pesan, 'countryCode' => '62'),
        CURLOPT_HTTPHEADER => array("Authorization: " . $token),
    ));

    $response = curl_exec($curl);
    $err = curl_error($curl);
    curl_close($curl);

    return !$err;
}
?>
