<?php

namespace App\Rest\Controllers;

use Illuminate\Support\Facades\DB;
use Lomkit\Rest\Http\Controllers\Controller as RestController;
use Lomkit\Rest\Http\Requests\MutateRequest;
use Throwable;

abstract class Controller extends RestController
{
    /**
     * The package opens a transaction and only commits on success; an exception
     * thrown mid-mutate (e.g. a policy denial) would leave it dangling.
     */
    public function mutate(MutateRequest $request)
    {
        $transactionLevel = DB::transactionLevel();

        try {
            return parent::mutate($request);
        } catch (Throwable $exception) {
            while (DB::transactionLevel() > $transactionLevel) {
                DB::rollBack();
            }

            throw $exception;
        }
    }
}
