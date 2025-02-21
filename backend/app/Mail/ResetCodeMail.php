<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ResetCodeMail extends Mailable
{
    use Queueable, SerializesModels;

    public $newCode;

    public function __construct($newCode)
    {
        $this->newCode = $newCode;
    }

    public function build()
    {
        return $this->subject('Votre nouveau code secret')
                    ->view('emails.resetCodePlain')
                    ->with(['code' => $this->newCode]);
    }
}
