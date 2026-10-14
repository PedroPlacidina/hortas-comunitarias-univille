<?php

use Slim\Routing\RouteCollectorProxy;
use App\Controllers\NotificacaoController;

return function (RouteCollectorProxy $group) {
    $group->group('/notificacoes', function (RouteCollectorProxy $group) {
        $group->get('', [NotificacaoController::class, 'list']);
        $group->get('/ativas', [NotificacaoController::class, 'listAtivas']);
        $group->get('/{id}', [NotificacaoController::class, 'get']);
        $group->post('', [NotificacaoController::class, 'create']);
        $group->post('/marcar-todas-lidas', [NotificacaoController::class, 'marcarTodasLidas']);
        $group->post('/{id}/marcar-lida', [NotificacaoController::class, 'marcarLida']);
        $group->put('/{id}', [NotificacaoController::class, 'update']);
        $group->delete('/{id}', [NotificacaoController::class, 'delete']);
    });
};
