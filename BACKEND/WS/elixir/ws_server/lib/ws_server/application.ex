defmodule WsServer.Application do
  use Application

  @impl true
  def start(_type, _args) do
    dispatch =
      :cowboy_router.compile([
        {:_,
         [
           {:_, WsServer.SocketHandler, []}
         ]}
      ])

    children = [
      {WsServer.Room, name: WsServer.Room},
      # Start Cowboy HTTP listener on port 4000 using :cowboy.child_spec
      {Plug.Cowboy,
       scheme: :http, plug: WsServer.SocketHandler, options: [port: 4000, dispatch: dispatch]}
    ]

    opts = [strategy: :one_for_one, name: WsServer.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
