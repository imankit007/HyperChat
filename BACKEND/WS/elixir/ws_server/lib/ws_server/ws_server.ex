defmodule WsServer.SocketHandler do
  @behaviour :cowboy_websocket

  @impl true
  def init(req, _state) do
    {:cowboy_websocket, req, %{nickname: random_name()}}
  end

  @impl true
  def websocket_init(state) do
    WsServer.Room.join(self())
    announce("#{state.nickname} joined")
    IO.puts("Client connected")
    {:ok, state}
  end

  @impl true
  def websocket_handle({:text, msg}, state) do
    IO.puts("Received: #{msg}")

    WsServer.Room.broadcast(self(), :chat, %{"from" => state.nickname, "text" => String.trim(msg)})

    {:ok, state}
  end

  def websocket_handle(_data, state), do: {:ok, state}

  @impl true
  def websocket_info({:broadcast, :chat, payload}, state) do
    {:reply, {:text, Jason.encode!(payload)}, state}
  end

  def websocket_info({:broadcast, :sys, payload}, state) do
    {:reply, {:text, Jason.encode!(%{"type" => "sys", "text" => payload})}, state}
  end

  def websocket_info(_msg, state), do: {:ok, state}

  # called when connection closes
  @impl true
  def terminate(_reason, _req, _state) do
    WsServer.Room.leave(self())
    IO.puts("Client disconnected")
    :ok
  end

  defp announce(text),
    do: WsServer.Room.broadcast(self(), :sys, text)

  defp random_name() do
    "user_" <>
      (:crypto.strong_rand_bytes(3) |> Base.url_encode64(padding: false))
  end
end
