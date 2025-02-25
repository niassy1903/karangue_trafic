<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\Infraction;

class InvoiceMail extends Mailable
{
    use Queueable, SerializesModels;

    public $infraction;

    public function __construct(Infraction $infraction)
    {
        $this->infraction = $infraction;
    }

    public function build()
    {
        return $this->view('emails.invoice')
                    ->subject('Facture de paiement d\'amende')
                    ->with(['infraction' => $this->infraction]);
    }
}
