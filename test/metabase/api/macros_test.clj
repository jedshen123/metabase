(ns metabase.api.macros-test
  (:require
   [clojure.test :refer :all]
   [metabase.api.macros :as api.macros]
   [metabase.util.malli.registry :as mr]))

(deftest ^:parallel closed-parameter-schema-test
  (doseq [params-type [:route :query :body]
          [schema params errors] [[[:map {:closed true} [:token :string]]
                                   {:token "token" :user-id {:raw "NULL"}}
                                   {:user-id "Unexpected parameter"}]
                                  [[:map [:credentials [:map {:closed true} [:token :string]]]]
                                   {:credentials {:token "token" :user-id 1}}
                                   {:credentials {:user-id "Unexpected parameter"}}]]]
    (testing "Unexpected keys in closed maps produce a validation error, including nested maps"
      (is (thrown-with-msg? clojure.lang.ExceptionInfo #"Invalid (body|route parameters|query parameters)"
                            (api.macros/decode-and-validate-params params-type schema params)))
      (is (= {:status-code 400 :errors errors}
             (try
               (api.macros/decode-and-validate-params params-type schema params)
               (catch clojure.lang.ExceptionInfo e
                 (select-keys (ex-data e) [:status-code :errors]))))))))

(deftest ^:parallel parse-args-test
  (are [args expected] (= expected
                          (#'api.macros/parse-args args))
    '(:post "/move"
            "Moves a number of Cards to a single collection or dashboard."
            [_route-params
             _query-params]
            (neat))
    '{:method :post
      :route {:path "/move"}
      :docstr "Moves a number of Cards to a single collection or dashboard."
      :params {:route {:binding _route-params}, :query {:binding _query-params}}
      :body [(neat)]}

    '(:post "/move"
            "Moves a number of Cards to a single collection or dashboard."
            [_route-params
             _query-params
             {:keys [card_ids], :as body} :- [:map
                                              [:card_ids [:sequential ms/PositiveInt]]]
             request :- [:map
                         [:form-params :map]]]
            (neat))
    '{:method :post
      :route {:path "/move"}
      :docstr "Moves a number of Cards to a single collection or dashboard."
      :params {:route   {:binding _route-params}
               :query   {:binding _query-params}
               :body    {:binding {:keys [card_ids], :as body}
                         :schema [:map [:card_ids [:sequential ms/PositiveInt]]]}
               :request {:binding request
                         :schema [:map [:form-params :map]]}}
      :body [(neat)]}

    ;; async
    '(:post "/move"
            [_route-params
             _query-params
             {:keys [card_ids], :as body} :- :map
             _request
             respond
             raise]
            (try
              (respond (wow))
              (catch Throwable e
                (raise e))))
    '{:method :post
      :route  {:path "/move"}
      :params {:route   {:binding _route-params}
               :query   {:binding _query-params}
               :body    {:binding {:keys [card_ids], :as body}, :schema :map}
               :request {:binding _request}
               :respond {:binding respond}
               :raise   {:binding raise}}
      :body [(try
               (respond (wow))
               (catch Throwable e (raise e)))]}))

(mr/def ::id pos-int?)

#_{:clj-kondo/ignore [:unused-private-var]}
(def ^:private RouteParams
  [:map
   [:id [:string {:api/regex #"[abc]{4}"}]]])

(deftest ^:parallel parse-args-regexes-test
  (are [args expected] (=? expected
                           (binding [*ns* (the-ns 'metabase.api.macros-test)]
                             (#'api.macros/parse-args args)))
    '(:post "/move/:id"
            [{:keys [id]} :- [:map
                              [:id pos-int?]]]
            (neat))
    {:route {:path "/move/:id", :regexes {:id #"[0-9]+"}}}

    '(:post "/move/:id"
            [{:keys [id]} :- [:map
                              [:id uuid?]]]
            (neat))
    {:route {:path "/move/:id", :regexes {:id #"[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}"}}}

    '(:post "/move/:id"
            [{:keys [id]} :- [:map
                              [:id ::id]]]
            (neat))
    {:route {:path "/move/:id", :regexes {:id #"[0-9]+"}}}

    '(:post "/move/:id"
            [{:keys [id]} :- RouteParams]
            (neat))
    {:route {:path "/move/:id", :regexes {:id #"[abc]{4}"}}}))

(deftest ^:parallel parse-args-metadata-test
  (testing "metadata map is parsed correctly"
    (are [args expected] (= expected
                            (#'api.macros/parse-args args))
      '(:get "/test"
             "A test endpoint."
             {:deprecated "0.57.0"}
             []
             (test))
      '{:method :get
        :route {:path "/test"}
        :docstr "A test endpoint."
        :metadata {:deprecated "0.57.0"}
        :params {}
        :body [(test)]}

      '(:get "/test"
             {:multipart true}
             []
             (test))
      '{:method :get
        :route {:path "/test"}
        :metadata {:multipart true}
        :params {}
        :body [(test)]}

      '(:post "/test"
              "Deprecated endpoint."
              {:deprecated "0.50.0", :multipart true}
              [_route-params
               _query-params]
              (test))
      '{:method :post
        :route {:path "/test"}
        :docstr "Deprecated endpoint."
        :metadata {:deprecated "0.50.0", :multipart true}
        :params {:route {:binding _route-params}, :query {:binding _query-params}}
        :body [(test)]})))
