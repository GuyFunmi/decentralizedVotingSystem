(define-map voters
  ((voter principal))
  ((hasVoted bool)))

(define-map candidates
  ((candidate-id uint))
  ((name (buff 50)) (voteCount uint)))

(define-constant ERR_ALREADY_VOTED (err u100))
(define-constant ERR_CANDIDATE_NOT_FOUND (err u101))

(define-public (add-candidate (candidate-id uint) (name (buff 50)))
  (begin
    (map-set candidates
      ((candidate-id candidate-id))
      ((name name) (voteCount u0)))
    (ok true)))

(define-public (vote (candidate-id uint))
  (let
    (
      (candidate (map-get? candidates ((candidate-id candidate-id))))
      (voter (map-get? voters ((voter tx-sender))))
    )
    (match voter
      some (err ERR_ALREADY_VOTED)
      none
      (match candidate
        some
        (begin
          (map-set voters ((voter tx-sender)) ((hasVoted true)))
          (map-set candidates
            ((candidate-id candidate-id))
            ((name (get name candidate))
             (voteCount (+ (get voteCount candidate) u1))))
          (ok true))
        none (err ERR_CANDIDATE_NOT_FOUND)))))
