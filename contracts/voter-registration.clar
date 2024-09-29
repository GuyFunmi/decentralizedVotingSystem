(define-map registered-voters
  ((voter principal))
  ((registered bool)))

(define-constant ERR_NOT_REGISTERED (err u104))

(define-public (register-voter)
  (begin
    (map-set registered-voters ((voter tx-sender)) ((registered true)))
    (ok true)))

(define-public (vote (candidate-id uint))
  (let
    (
      (voter (map-get? registered-voters ((voter tx-sender))))
    )
    (match voter
      some
      (if (is-eq (get registered voter) true)
          (begin
            ;; Insert the actual voting logic here
            (contract-call? .voting-system vote candidate-id))
          (err ERR_NOT_REGISTERED))
      none (err ERR_NOT_REGISTERED))))
