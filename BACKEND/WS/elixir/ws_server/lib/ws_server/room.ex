defmodule WsServer.Room do
  @moduledoc """
  Tracks connected WebSocket PIDs and broadcasts messages to all.
  """
  use GenServer

  ## Public API

  def start_link(opts), do: GenServer.start_link(__MODULE__, :ok, opts)

  def join(pid), do: GenServer.cast(__MODULE__, {:join, pid})
  def leave(pid), do: GenServer.cast(__MODULE__, {:leave, pid})

  def broadcast(from_pid, event, payload),
    do: GenServer.cast(__MODULE__, {:broadcast, from_pid, event, payload})

  ## Callbacks

  @impl true
  def init(:ok), do: {:ok, MapSet.new()}

  @impl true
  def handle_cast({:join, pid}, set) do
    Process.monitor(pid)
    {:noreply, MapSet.put(set, pid)}
  end

  def handle_cast({:leave, pid}, set) do
    {:noreply, MapSet.delete(set, pid)}
  end

  def handle_cast({:broadcast, from, event, payload}, set) do
    msg = {:broadcast, event, payload}
    Enum.each(set, fn pid ->  if pid != from do  Kernel.send(pid, msg) end end)
    {:noreply, set}
  end

  @impl true
  def handle_info({:DOWN, _ref, :process, pid, _reason}, set) do
    {:noreply, MapSet.delete(set, pid)}
  end
end
